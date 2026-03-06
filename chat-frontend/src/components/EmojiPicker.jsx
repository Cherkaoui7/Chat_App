import { useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiPickerComponent({ onEmojiClick, onClose }) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={ref} className="z-50">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-slide-in">
                <EmojiPicker
                    onEmojiClick={(emojiData) => {
                        onEmojiClick(emojiData.emoji);
                    }}
                    skinTonesDisabled={false}
                    searchPlaceHolder="Search emoji..."
                    height={350}
                    width={320}
                />
            </div>
        </div>
    );
}
