import { format } from "date-fns";
import { SmilePlus, MoreHorizontal } from "lucide-react";

export default function MessageBubble({ message, isOwnMessage, showSenderName }) {
    const time = message.created_at ? format(new Date(message.created_at), "h:mm a") : "";

    return (
        <div className={`flex w-full animate-message-appear group ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[60%] flex-col ${isOwnMessage ? "items-end" : "items-start"} relative`}>

                <div
                    className={`relative px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all ${isOwnMessage
                        ? "bg-[#0f766e] text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                        }`}
                    style={{
                        borderRadius: "16px",
                        borderTopRightRadius: isOwnMessage ? "4px" : "16px",
                        borderTopLeftRadius: isOwnMessage ? "16px" : "4px"
                    }}
                >
                    {/* If group chat, show name of sender if it's not our own message and grouping requires it */}
                    {!isOwnMessage && message.sender && showSenderName && (
                        <div className="mb-0.5 text-[12px] font-semibold text-teal-600">
                            {message.sender.name}
                        </div>
                    )}

                    <div style={{ wordBreak: 'break-word' }}>
                        {message.message}
                    </div>

                    <div className={`mt-1 text-right text-[11px] ${isOwnMessage ? "text-teal-100" : "text-gray-400"}`}>
                        {time}
                    </div>
                </div>

                {/* Hover Actions */}
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100 ${isOwnMessage ? "right-full mr-2" : "left-full ml-2"
                    }`}>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
                        <SmilePlus size={14} />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
                        <MoreHorizontal size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}
