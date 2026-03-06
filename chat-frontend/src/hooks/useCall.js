import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { getEcho, connectSocket } from "../services/socket";

export function useCall(localVideoRef, remoteVideoRef) {
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const STUN_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize WebRTC peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to other peer via backend
        // This will be handled when we have the target user ID
        console.log('New ICE candidate:', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef?.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteStreamRef.current = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [remoteVideoRef]);

  // Get local media stream
  const getLocalStream = useCallback(async (type) => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video' && !isVideoOff,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef?.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, [localVideoRef, isVideoOff]);

  // Start a call
  const startCall = useCallback(async (targetUserId, type = 'video') => {
    try {
      setCallType(type);
      setCallStatus('calling');
      setIsInCall(true);

      // Get local media stream
      await getLocalStream(type);

      // Create peer connection
      const pc = createPeerConnection();

      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to backend
      const response = await api.post('/call/initiate', {
        target_user_id: targetUserId,
        type: type,
        offer: {
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type,
        },
      });

      console.log('Call initiated:', response.data);

      // Listen for answer
      const echo = getEcho() || connectSocket();
      const callChannel = echo.private(`call.${targetUserId}`);

      callChannel.listen('.CallAccepted', async (e) => {
        console.log('Call accepted:', e.call);
        await pc.setRemoteDescription(new RTCSessionDescription(e.call.answer));
      });

      callChannel.listen('.CallRejected', (e) => {
        console.log('Call rejected:', e.call);
        endCall();
      });

      callChannel.listen('.CallEnded', (e) => {
        console.log('Call ended by other party');
        endCall();
      });

      callChannel.listen('.IceCandidate', async (e) => {
        if (e.ice.candidate && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(e.ice.candidate));
        }
      });

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  }, [createPeerConnection, getLocalStream]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      setCallType(incomingCall.call.type);
      setCallStatus('calling');
      setIsInCall(true);

      // Get local media stream
      await getLocalStream(incomingCall.call.type);

      // Create peer connection
      const pc = createPeerConnection();

      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Set remote description (offer)
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.call.offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to backend
      const response = await api.post('/call/accept', {
        caller_id: incomingCall.call.caller_id,
        answer: {
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type,
        },
      });

      console.log('Call accepted:', response.data);

      // Listen for end call and ICE candidates
      const echo = getEcho() || connectSocket();
      const callChannel = echo.private(`call.${incomingCall.call.caller_id}`);

      callChannel.listen('.CallEnded', () => {
        endCall();
      });

      callChannel.listen('.IceCandidate', async (e) => {
        if (e.ice.candidate && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(e.ice.candidate));
        }
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  }, [incomingCall, createPeerConnection, getLocalStream]);

  // Reject an incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await api.post('/call/reject', {
        caller_id: incomingCall.call.caller_id,
        reason: 'busy',
      });
      setIncomingCall(null);
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }, [incomingCall]);

  // End the call
  const endCall = useCallback(async () => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Clear video sources
    if (localVideoRef?.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef?.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsInCall(false);
    setCallType(null);
    setCallStatus('idle');
    setIsMuted(false);
    setIsVideoOff(false);
    setIncomingCall(null);
  }, [localVideoRef, remoteVideoRef]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Listen for incoming calls
  useEffect(() => {
    const echo = getEcho() || connectSocket();
    if (!echo) return;

    // Get current user ID from auth
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const callChannel = echo.private(`call.${userId}`);

    callChannel.listen('.CallInitiated', (e) => {
      console.log('Incoming call:', e.call);
      setIncomingCall(e);
    });

    return () => {
      echo.leave(`call.${userId}`);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    isInCall,
    callType,
    incomingCall,
    isMuted,
    isVideoOff,
    callStatus,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
