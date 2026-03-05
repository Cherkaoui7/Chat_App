import { useState, useEffect, useRef } from "react";
import { X, Search, User as UserIcon, Loader2 } from "lucide-react";
import api from "../services/api";

export default function NewChatModal({ isOpen, onClose, onUserSelect }) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-focus the input when modal opens
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
            setSearch("");
            setUsers([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (search.trim()) {
            setIsLoading(true);
            const delayDebounceFn = setTimeout(() => {
                fetchUsers(search);
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setUsers([]);
            setIsLoading(false);
        }
    }, [search]);

    const fetchUsers = async (query) => {
        try {
            // Backend expects 'q' query parameter
            const res = await api.get(`/search-users?q=${query}`);
            // The Laravel resource likely wraps in `.data`
            setUsers(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="flex h-full max-h-[500px] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-800">New Chat</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="border-b px-5 py-3 relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 animate-spin text-blue-500" size={18} />
                        )}
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto">
                    {search.trim() === "" ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            Type a name or email to start searching
                        </div>
                    ) : users.length === 0 && !isLoading ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            No users found matching "{search}"
                        </div>
                    ) : (
                        <div className="p-2">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => onUserSelect(u.id)}
                                    className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-blue-50 transition"
                                >
                                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold">{u.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{u.name}</span>
                                        <span className="text-sm text-gray-500">{u.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
