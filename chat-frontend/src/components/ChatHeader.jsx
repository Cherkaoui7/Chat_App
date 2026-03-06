import { Phone, Video, MoreVertical, X } from "lucide-react";
import { useState } from "react";

export default function ChatHeader({ user, online, onInitiateCall }) {
    const [showMenu, setShowMenu] = useState(false);

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
            <div className="flex items-center space-x-4 text-gray-400 relative">
                <button 
                    onClick={() => onInitiateCall?.('audio')}
                    className="hover:text-indigo-600 transition-colors"
                    title="Audio Call"
                >
                    <Phone size={20} />
                </button>
                <button 
                    onClick={() => onInitiateCall?.('video')}
                    className="hover:text-indigo-600 transition-colors"
                    title="Video Call"
                >
                    <Video size={20} />
                </button>
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="hover:text-indigo-600 transition-colors"
                        title="More Options"
                    >
                        <MoreVertical size={20} />
                    </button>
                    
                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <Phone size={16} /> Audio Call
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <Video size={16} /> Video Call
                                </button>
                                <hr className="my-1" />
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <X size={16} /> Block User
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <X size={16} /> Report User
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
