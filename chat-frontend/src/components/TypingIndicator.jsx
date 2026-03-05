export default function TypingIndicator({ user }) {
    if (!user) return null;

    return (
        <div className="flex w-full justify-start mt-4 mb-2 animate-message-appear">
            <div className="flex items-center space-x-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm border border-gray-100/50"
                style={{ borderRadius: "16px", borderTopLeftRadius: "4px" }}>
                <span className="text-[13px] font-medium text-gray-500">{user.name} is typing</span>
                <div className="flex items-center pt-[5px]">
                    <span className="h-1 w-1 rounded-full bg-indigo-400 typing-dot"></span>
                    <span className="h-1 w-1 rounded-full bg-indigo-400 typing-dot"></span>
                    <span className="h-1 w-1 rounded-full bg-indigo-400 typing-dot"></span>
                </div>
            </div>
        </div>
    );
}
