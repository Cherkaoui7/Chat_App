import { Phone, Video, MoreVertical } from "lucide-react";

export default function ChatHeader({ user, online }) {
    if (!user) return null;

    return (
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 min-w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-600">
                            {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    {online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[16px] font-semibold text-gray-900">{user.name}</span>
                    <span className="text-[13px] text-gray-500">{online ? "● Online" : "Offline"}</span>
                </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
                <button className="hover:text-indigo-600 transition-colors"><Phone size={20} /></button>
                <button className="hover:text-indigo-600 transition-colors"><Video size={20} /></button>
                <button className="hover:text-indigo-600 transition-colors"><MoreVertical size={20} /></button>
            </div>
        </div>
    );
}
