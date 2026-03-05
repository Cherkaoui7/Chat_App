import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { usePresence } from "../hooks/usePresence";
import { LogOut, User as UserIcon, Plus } from "lucide-react";
import NewChatModal from "./NewChatModal";
import { format, isToday } from "date-fns";

export default function Sidebar({ onSelectConversation, activeConversationId, latestMessageUpdate }) {
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
                // Find and update the conversation, and sort it to top
                let updated = prev.map(c =>
                    c.id === latestMessageUpdate.convId
                        ? { ...c, latest_message: latestMessageUpdate.msg }
                        : c
                );
                // Sort by latest message
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
        <div className="flex w-80 flex-col border-r bg-gray-50">
            <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 truncate w-32">{user?.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 transition">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-100">
                <span className="text-sm font-semibold text-gray-600">Messages</span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    title="New Chat"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Recent Chats</div>
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
                    )}
                    {conversations.map(conv => {
                        const otherUser = conv.users.find(u => u.id !== user?.id);
                        const isActive = activeConversationId === conv.id;
                        const online = otherUser ? isUserOnline(otherUser.id) : false;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`flex cursor-pointer items-center p-4 border-b transition-colors ${isActive ? 'bg-[#f1f5f9] border-l-4 border-l-blue-500' : 'hover:bg-[#f1f5f9] border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative mr-3">
                                    {otherUser?.avatar ? (
                                        <img src={otherUser.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-gray-700">
                                            {otherUser?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {online && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="font-semibold text-[15px] text-gray-900 truncate">
                                            {conv.is_group ? conv.name : otherUser?.name}
                                        </h4>
                                        {conv.latest_message && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {format(new Date(conv.latest_message.created_at), isToday(new Date(conv.latest_message.created_at)) ? "h:mm a" : "MMM d")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[13px] text-gray-500 truncate mt-0.5">
                                        {!conv.latest_message ? (
                                            <span className="italic">No messages yet</span>
                                        ) : (
                                            <span>
                                                {conv.latest_message.sender_id === user?.id ? "You: " : ""}
                                                {conv.latest_message.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* New Chat Modal Mount */}
            <NewChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserSelect={startConversation}
            />
        </div>
    );
}
