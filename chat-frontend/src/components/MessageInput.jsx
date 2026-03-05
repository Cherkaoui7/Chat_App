import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage, onTyping }) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(text);
            setText("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="border-t bg-white p-3 shadow-sm px-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (onTyping) onTyping(true);
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-[24px] border border-gray-200 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors text-[15px]"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || isSending}
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Send size={18} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
}
