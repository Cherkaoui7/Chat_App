import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatDashboard() {
    const { user, authLoading } = useAuth();
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [latestMessageUpdate, setLatestMessageUpdate] = useState(null);

    if (authLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <ChatSidebar
                onSelectConversation={setActiveConversationId}
                activeConversationId={activeConversationId}
                latestMessageUpdate={latestMessageUpdate}
            />
            <div className="flex flex-1 flex-col">
                {activeConversationId ? (
                    <ChatWindow
                        conversationId={activeConversationId}
                        onNewMessage={(msg, convId) => setLatestMessageUpdate({ msg, convId })}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
