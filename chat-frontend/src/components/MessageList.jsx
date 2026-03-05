import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, user, isTyping, typingUser, loading, hasMore, loadMore }) {
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
                // hit top, load more
                loadMore();
            }
        }
    };

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-3 relative"
        >
            {loading && hasMore && (
                <div className="text-center text-sm text-gray-500 py-2">Loading older messages...</div>
            )}

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
                <TypingIndicator user={typingUser} />
            )}

            <div ref={endOfMessagesRef} className="h-4" />
        </div>
    );
}
