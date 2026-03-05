import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversationId }) {
    const { messages, loading, hasMore, loadMore, sendMessage } = useChat(conversationId);
    const { user } = useAuth();
    const endOfMessagesRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        <div className="flex h-full flex-col bg-[#f0f2f5]">
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
                    {messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.id || index}
                            message={msg}
                            isOwnMessage={msg.sender_id === user?.id}
                        />
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>

            {/* Input Area */}
            <MessageInput onSendMessage={sendMessage} />
        </div>
    );
}
