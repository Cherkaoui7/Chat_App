import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversationId }) {
    const { messages, loading, hasMore, loadMore, sendMessage, isTyping, typingUser, sendTypingEvent } = useChat(conversationId);
    const { user } = useAuth();
    const endOfMessagesRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Auto scroll to bottom when new messages arrive or typing status changes
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop } = scrollContainerRef.current;
            if (scrollTop === 0 && hasMore && !loading) {
                // We hit the top, load more!
                loadMore();
            }
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            {/* Header could go here showing current active user's info */}
            <div className="border-b bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800">Chat</h3>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4"
            >
                {loading && hasMore && (
                    <div className="text-center text-sm text-gray-500 py-2">Loading older messages...</div>
                )}

                <div className="flex flex-col space-y-2">
                    {messages.map((msg, index) => {
                        const isOwnMessage = msg.sender_id === user?.id;
                        const previousMsg = index > 0 ? messages[index - 1] : null;
                        const showSenderName = !previousMsg || previousMsg.sender_id !== msg.sender_id;

                        return (
                            <MessageBubble
                                key={msg.id || index}
                                message={msg}
                                isOwnMessage={isOwnMessage}
                                showSenderName={showSenderName}
                            />
                        );
                    })}
                    {isTyping && typingUser && typingUser.id !== user?.id && (
                        <div className="flex w-full justify-start mt-2">
                            <div
                                className="flex items-center space-x-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm border border-gray-100"
                                style={{ borderRadius: "16px", borderTopLeftRadius: "0" }}
                            >
                                <span className="text-[13px] font-medium text-gray-500">{typingUser.name} is typing</span>
                                <div className="flex items-center pt-1.5">
                                    <span className="h-1 w-1 rounded-full bg-gray-400 typing-dot"></span>
                                    <span className="h-1 w-1 rounded-full bg-gray-400 typing-dot"></span>
                                    <span className="h-1 w-1 rounded-full bg-gray-400 typing-dot"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>

            {/* Input Area */}
            <MessageInput
                onSendMessage={sendMessage}
                onTyping={(isTypingStatus) => sendTypingEvent(isTypingStatus, user)}
            />
        </div>
    );
}
