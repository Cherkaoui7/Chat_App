import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

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
        <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0">
                    <Paperclip size={20} />
                </button>
                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-[24px] px-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors">
                    <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors shrink-0">
                        <Smile size={20} />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (onTyping) onTyping(true);
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-2 py-3 focus:outline-none text-[15px] text-gray-800 placeholder-gray-400"
                        disabled={isSending}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!text.trim() || isSending}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Send size={18} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
}
