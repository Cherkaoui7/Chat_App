import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { usePresence } from "../hooks/usePresence";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";

export default function ChatWindow({ conversationId, onNewMessage }) {
    const { conversation, messages, loading, hasMore, loadMore, sendMessage, isTyping, typingUser, sendTypingEvent } = useChat(conversationId, onNewMessage);
    const { user } = useAuth();
    const { isUserOnline } = usePresence();

    const otherUser = conversation?.is_group ? null : conversation?.users?.find(u => u.id !== user?.id);
    const online = otherUser ? isUserOnline(otherUser.id) : false;

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            {conversation ? (
                <ChatHeader
                    user={conversation.is_group ? { name: conversation.name, avatar: null } : otherUser}
                    online={conversation.is_group ? false : online}
                />
            ) : (
                <div className="h-16 shrink-0 border-b border-gray-200 bg-white shadow-sm flex items-center px-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
            )}

            <MessageList
                messages={messages}
                user={user}
                isTyping={isTyping}
                typingUser={typingUser}
                loading={loading}
                hasMore={hasMore}
                loadMore={loadMore}
            />

            <MessageInput
                onSendMessage={sendMessage}
                onTyping={(isTypingStatus) => sendTypingEvent(isTypingStatus, user)}
            />
        </div>
    );
}
