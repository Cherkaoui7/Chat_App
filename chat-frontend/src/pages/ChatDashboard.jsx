import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatDashboard() {
    const { user, authLoading } = useAuth();
    const [activeConversationId, setActiveConversationId] = useState(null);

    if (authLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar
                onSelectConversation={setActiveConversationId}
                activeConversationId={activeConversationId}
            />
            <div className="flex flex-1 flex-col">
                {activeConversationId ? (
                    <ChatWindow conversationId={activeConversationId} />
                ) : (
                    <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
