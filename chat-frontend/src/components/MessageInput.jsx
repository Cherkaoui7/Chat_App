import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage }) {
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
        <div className="border-t bg-[#f0f2f5] p-3 shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 rounded-lg border-none bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || isSending}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00a884] text-white hover:bg-[#008f6f] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                    <Send size={20} className="ml-1" />
                </button>
            </form>
        </div>
    );
}
