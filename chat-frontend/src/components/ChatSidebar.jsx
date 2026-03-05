import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { usePresence } from "../hooks/usePresence";
import { LogOut, Plus } from "lucide-react";
import NewChatModal from "./NewChatModal";
import ConversationItem from "./ConversationItem";

export default function ChatSidebar({ onSelectConversation, activeConversationId, latestMessageUpdate }) {
    const [conversations, setConversations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isUserOnline } = usePresence();

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (latestMessageUpdate) {
            setConversations(prev => {
                let updated = prev.map(c =>
                    c.id === latestMessageUpdate.convId
                        ? { ...c, latest_message: latestMessageUpdate.msg }
                        : c
                );
                updated.sort((a, b) => {
                    const dateA = a.latest_message ? new Date(a.latest_message.created_at) : new Date(a.updated_at);
                    const dateB = b.latest_message ? new Date(b.latest_message.created_at) : new Date(b.updated_at);
                    return dateB - dateA;
                });
                return updated;
            });
        }
    }, [latestMessageUpdate]);

    const fetchConversations = async () => {
        try {
            const res = await api.get("/conversations");
            setConversations(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (otherUserId) => {
        try {
            const res = await api.post("/conversations", { participant_id: otherUserId });
            await fetchConversations();
            onSelectConversation(res.data.id);
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex w-[300px] shrink-0 flex-col border-r border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-[16px] text-gray-900 truncate w-[160px]">{user?.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Messages</span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="New Chat"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                <div className="py-2">
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
                    )}
                    {conversations.map(conv => {
                        const otherUser = conv.users.find(u => u.id !== user?.id);
                        const isActive = activeConversationId === conv.id;
                        const online = otherUser ? isUserOnline(otherUser.id) : false;

                        return (
                            <ConversationItem
                                key={conv.id}
                                conv={conv}
                                currentUser={user}
                                isActive={isActive}
                                online={online}
                                onClick={() => onSelectConversation(conv.id)}
                            />
                        );
                    })}
                </div>
            </div>

            <NewChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserSelect={startConversation}
            />
        </div>
    );
}
