import { useState, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";

export default function CallModal({
  call,
  onAccept,
  onReject,
  onEnd,
  isMuted,
  onToggleMute,
  callDuration = 0,
  error = null
}) {
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [formattedDuration, setFormattedDuration] = useState('00:00');

  useEffect(() => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    setFormattedDuration(
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    );
  }, [callDuration]);

  if (!call) return null;

  const isIncoming = call.isIncoming;
  const isConnected = call.status === 'connected';
  const isCalling = call.status === 'calling' || call.status === 'ringing' || call.status === 'connecting';

  const getStatusText = () => {
    switch (call.status) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'ended':
        return 'Call ended';
      case 'incoming':
        return 'Incoming Audio Call...';
      default:
        return 'Incoming call...';
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      {/* Call Modal Container */}
      <div className="relative w-[400px] h-[520px] rounded-3xl overflow-hidden shadow-2xl">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
          {/* Animated particles/stars effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between px-8 py-6">
          {/* Top Bar - Timer and Close */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/90 font-mono text-sm">
              <span>{formattedDuration}</span>
            </div>
            <button
              onClick={isIncoming ? onReject : onEnd}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Content - Avatar and Info */}
          <div className="flex flex-col items-center justify-center flex-1">
            {/* Avatar */}
            <div className="relative mb-6">
              {call.caller_avatar ? (
                <img
                  src={call.caller_avatar}
                  alt={call.caller_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white/10">
                  {getInitial(call.caller_name)}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-indigo-900 shadow-lg"></div>
            </div>

            {/* Username */}
            <h2 className="text-2xl font-bold text-white mb-2">{call.caller_name || 'Unknown'}</h2>

            {/* Status Text */}
            <p className="text-white/60 text-sm mb-3">{getStatusText()}</p>

            {/* Status Badge */}
            {isConnected && (
              <div className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                Connected
              </div>
            )}
            {isCalling && !isIncoming && (
              <div className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium animate-pulse">
                {call.status === 'ringing' ? 'Ringing...' : 'Connecting...'}
              </div>
            )}
            {isIncoming && (
              <div className="px-4 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-400 text-xs font-medium">
                Ringing...
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Bottom - Control Buttons */}
          <div className="w-full">
            {isIncoming ? (
              /* Incoming Call Controls */
              <div className="flex items-center justify-center gap-4">
                {/* Decline Button */}
                <button
                  onClick={onReject}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105"
                  title="Decline"
                >
                  <PhoneOff size={28} />
                </button>

                {/* Mute Button */}
                <button
                  onClick={onToggleMute}
                  className={`flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-105 ${
                    isMuted 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Accept Button */}
                <button
                  onClick={onAccept}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
                  title="Accept"
                >
                  <Phone size={28} />
                </button>
              </div>
            ) : (
              /* Outgoing Call Controls */
              <div className="flex items-center justify-center gap-4">
                {/* Mute Button */}
                <button
                  onClick={onToggleMute}
                  className={`flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-105 ${
                    isMuted 
                      ? 'bg-white text-indigo-900' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={onEnd}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105"
                  title="End call"
                >
                  <PhoneOff size={28} />
                </button>

                {/* Speaker Button */}
                <button
                  onClick={handleToggleSpeaker}
                  className={`flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-105 ${
                    isSpeakerOn 
                      ? 'bg-white text-indigo-900' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isSpeakerOn ? 'Speaker on' : 'Speaker off'}
                >
                  {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
