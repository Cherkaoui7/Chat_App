import { format } from "date-fns";

export default function MessageBubble({ message, isOwnMessage }) {
    const time = message.created_at ? format(new Date(message.created_at), "h:mm a") : "";

    return (
        <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[70%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                <div
                    className={`relative rounded-2xl px-4 py-2 text-[15px] shadow-sm ${isOwnMessage
                        ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                        : "bg-white text-[#111b21] rounded-tl-none border border-gray-100"
                        }`}
                >
                    {/* If group chat, show name of sender if it's not our own message */}
                    {!isOwnMessage && message.sender && (
                        <div className="mb-1 text-[13px] font-semibold text-purple-600">
                            {message.sender.name}
                        </div>
                    )}

                    <div style={{ wordBreak: 'break-word' }}>
                        {message.message}
                    </div>

                    <div className={`mt-1 text-right text-[11px] ${isOwnMessage ? "text-[#8696a0]" : "text-gray-400"}`}>
                        {time}
                    </div>
                </div>
            </div>
        </div>
    );
}
