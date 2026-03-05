import { format, isToday } from "date-fns";

export default function ConversationItem({ conv, currentUser, isActive, online, onClick }) {
    const otherUser = conv.is_group ? null : conv.users.find(u => u.id !== currentUser?.id);
    const displayName = conv.is_group ? conv.name : otherUser?.name;
    const avatar = otherUser?.avatar;

    return (
        <div
            onClick={onClick}
            className={`flex cursor-pointer items-center px-4 py-3 transition-colors ${isActive
                ? 'bg-[#eef2ff] border-l-[3px] border-indigo-500'
                : 'hover:bg-[#f1f5f9] border-l-[3px] border-transparent'
                }`}
        >
            <div className="relative mr-3 shrink-0">
                {avatar ? (
                    <img src={avatar} alt="Avatar" className="h-[42px] w-[42px] rounded-full object-cover" />
                ) : (
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-slate-200 font-semibold text-gray-700">
                        {displayName?.charAt(0)?.toUpperCase()}
                    </div>
                )}
                {online && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-[15px] text-gray-900 truncate pr-2">
                        {displayName}
                    </h4>
                    {conv.latest_message && (
                        <span className="text-[12px] text-gray-400 shrink-0">
                            {format(new Date(conv.latest_message.created_at), isToday(new Date(conv.latest_message.created_at)) ? "h:mm a" : "MMM d")}
                        </span>
                    )}
                </div>
                <div className="text-[13px] text-gray-500 truncate mt-0.5">
                    {!conv.latest_message ? (
                        <span className="italic">No messages yet</span>
                    ) : (
                        <span>
                            {conv.latest_message.sender_id === currentUser?.id ? "You: " : ""}
                            {conv.latest_message.message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
