import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { LogOut, User as UserIcon, Plus } from "lucide-react";

export default function Sidebar({ onSelectConversation, activeConversationId }) {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (search.trim()) {
            const delayDebounceFn = setTimeout(() => fetchUsers(search), 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setUsers([]);
        }
    }, [search]);

    const fetchConversations = async () => {
        try {
            const res = await api.get("/conversations");
            setConversations(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async (query) => {
        try {
            const res = await api.get(`/search-users?search=${query}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (otherUserId) => {
        try {
            const res = await api.post("/conversations", { user_id: otherUserId });
            await fetchConversations();
            onSelectConversation(res.data.id);
            setSearch("");
            setUsers([]);
            setIsSearching(false);
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
                    onClick={() => {
                        setIsSearching(!isSearching);
                        if (isSearching) {
                            setSearch("");
                            setUsers([]);
                        }
                    }}
                    className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    title="New Chat"
                >
                    <Plus size={18} />
                </button>
            </div>

            {isSearching && (
                <div className="p-4 border-b bg-white">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
                        autoFocus
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {search.trim() && users.length > 0 ? (
                    <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Search Results</div>
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => startConversation(u.id)}
                                className="flex cursor-pointer items-center p-3 hover:bg-gray-100 border-b"
                            >
                                <UserIcon className="mr-3 h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{u.name}</span>
                                    <span className="text-sm text-gray-500">{u.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Recent Chats</div>
                        {conversations.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
                        )}
                        {conversations.map(conv => {
                            const otherUser = conv.users.find(u => u.id !== user?.id);
                            const isActive = activeConversationId === conv.id;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => onSelectConversation(conv.id)}
                                    className={`flex cursor-pointer items-center p-4 border-b transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                                >
                                    <div className="relative">
                                        {otherUser?.avatar ? (
                                            <img src={otherUser.avatar} alt="Avatar" className="mr-4 h-12 w-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                                                {otherUser?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex flex-col mb-1">
                                            <h4 className="font-semibold text-gray-800 truncate">{conv.is_group ? conv.name : otherUser?.name}</h4>
                                            {!conv.is_group && otherUser?.email && (
                                                <span className="text-xs text-gray-500 truncate">{otherUser.email}</span>
                                            )}
                                        </div>
                                        {conv.last_message && (
                                            <p className="truncate text-sm text-gray-500">
                                                {conv.last_message.sender_id === user?.id ? "You: " : ""}{conv.last_message.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
