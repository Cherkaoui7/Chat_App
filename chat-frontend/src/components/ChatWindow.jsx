import { useRef, useState, useEffect, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { usePresence } from "../hooks/usePresence";
import { useCall } from "../hooks/useCall";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import CallModal from "./CallModal";

export default function ChatWindow({ conversationId, onNewMessage }) {
    const { conversation, messages, loading, hasMore, loadMore, sendMessage, sendFile, isTyping, typingUser, sendTypingEvent, deleteMessage } = useChat(conversationId, onNewMessage);
    const { user } = useAuth();
    const { isUserOnline } = usePresence();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const {
        isInCall,
        callType,
        incomingCall,
        isMuted,
        isVideoOff,
        callStatus,
        callDuration,
        error,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
    } = useCall(localVideoRef, remoteVideoRef);

    const otherUser = conversation?.is_group ? null : conversation?.users?.find(u => u.id !== user?.id);
    const online = otherUser ? isUserOnline(otherUser.id) : false;

    const [callModalData, setCallModalData] = useState(null);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    // Update call modal data based on call state
    useEffect(() => {
        if (incomingCall) {
            setCallModalData({
                isIncoming: true,
                caller_id: incomingCall.call.caller_id,
                caller_name: incomingCall.call.caller_name,
                caller_avatar: incomingCall.call.caller_avatar,
                type: incomingCall.call.type,
                status: 'incoming',
            });
        } else if (isInCall) {
            setCallModalData({
                isIncoming: false,
                caller_name: otherUser?.name,
                caller_avatar: otherUser?.avatar,
                type: callType,
                status: callStatus,
                localVideoRef,
                remoteVideoRef,
            });
        } else {
            setCallModalData(null);
        }
    }, [incomingCall, isInCall, callType, callStatus, otherUser, localVideoRef, remoteVideoRef]);

    const handleInitiateCall = (type) => {
        if (!otherUser?.id) return;
        startCall(otherUser.id, type);
    };

    const handleAcceptCall = () => {
        acceptCall();
    };

    const handleRejectCall = () => {
        rejectCall();
    };

    const handleEndCall = () => {
        endCall();
    };

    // Message handlers
    const handleReply = useCallback((message) => {
        console.log('Reply to message:', message);
        setReplyToMessage(message);
        // Scroll to input and focus
        const inputElement = document.querySelector('input[type="text"]');
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    const handleDelete = useCallback(async (messageId) => {
        console.log('Delete message:', messageId);
        try {
            await deleteMessage(messageId);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, [deleteMessage]);

    const handleEdit = useCallback((message) => {
        console.log('Edit message:', message);
        setEditingMessage(message);
        // Scroll to input and focus
        const inputElement = document.querySelector('input[type="text"]');
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    return (
        <div className="flex h-full flex-col bg-[#f8fafc] relative">
            {conversation ? (
                <ChatHeader
                    user={conversation.is_group ? { name: conversation.name, avatar: null } : otherUser}
                    online={conversation.is_group ? false : online}
                    isInCall={isInCall}
                    callDuration={callDuration}
                    onInitiateCall={handleInitiateCall}
                    onEndCall={handleEndCall}
                />
            ) : (
                <div className="h-16 shrink-0 border-b border-gray-200 bg-white shadow-sm flex items-center px-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
            )}

            <MessageList
                messages={messages}
                user={user}
                isTyping={false}
                typingUser={null}
                loading={loading}
                hasMore={hasMore}
                loadMore={loadMore}
                onReply={handleReply}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            <MessageInput
                onSendMessage={sendMessage}
                onSendFile={sendFile}
                onTyping={(isTypingStatus) => sendTypingEvent(isTypingStatus, user)}
                conversationId={conversationId}
                replyToMessage={replyToMessage}
                onClearReply={() => setReplyToMessage(null)}
                editingMessage={editingMessage}
                onClearEdit={() => setEditingMessage(null)}
            />

            {/* Call Modal */}
            {callModalData && (
                <CallModal
                    call={callModalData}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                    onEnd={handleEndCall}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    callDuration={callDuration}
                    error={error}
                />
            )}
        </div>
    );
}
