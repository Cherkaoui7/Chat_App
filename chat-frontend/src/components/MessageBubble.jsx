import { format } from "date-fns";
import { SmilePlus, MoreHorizontal, Download, File, Image as ImageIcon, Video, Music, Mic, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import EmojiPickerComponent from "./EmojiPicker";

export default function MessageBubble({ message, isOwnMessage, showSenderName, onReply, onDelete, onEdit }) {
    const time = message.created_at ? format(new Date(message.created_at), "h:mm a") : "";
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const [isPlaying, setIsPlaying] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const emojiRef = useRef(null);

    // Close menu/emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleEmojiClick = (emoji) => {
        // For now, we'll just log it - you can implement reaction logic here
        console.log("Emoji reaction:", emoji);
        setShowEmojiPicker(false);
    };

    const getFileUrl = () => {
        if (message.file_path) {
            return `${apiUrl}/storage/${message.file_path}`;
        }
        return null;
    };

    const getFileIcon = () => {
        if (message.type === 'image') return <ImageIcon size={20} />;
        if (message.type === 'video') return <Video size={20} />;
        if (message.type === 'audio') return <Music size={20} />;
        return <File size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderFileContent = () => {
        const fileUrl = getFileUrl();

        if (!fileUrl) return null;

        // Image
        if (message.type === 'image') {
            return (
                <div className="mt-2">
                    <img
                        src={fileUrl}
                        alt={message.file_name || 'Image'}
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                    />
                </div>
            );
        }

        // Video
        if (message.type === 'video') {
            return (
                <div className="mt-2">
                    <video
                        src={fileUrl}
                        controls
                        className="max-w-full rounded-lg"
                        style={{ maxHeight: '300px' }}
                    />
                </div>
            );
        }

        // Audio / Voice message
        if (message.type === 'audio') {
            return (
                <div className="flex items-center gap-2 min-w-[180px]">
                    <audio
                        src={fileUrl}
                        controls
                        className="flex-1 h-8"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />
                </div>
            );
        }

        // Generic file
        return (
            <div className="mt-2 flex items-center gap-3 bg-black/10 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-300">
                    {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.file_name || message.message}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(message.file_size)}</p>
                </div>
                <a
                    href={fileUrl}
                    download={message.file_name}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Download"
                >
                    <Download size={18} />
                </a>
            </div>
        );
    };

    return (
        <div className={`flex w-full animate-message-appear group relative ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[60%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>

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

                    {/* Hover Actions - Position based on message ownership */}
                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwnMessage ? "-left-10" : "-right-10"
                        }`}>
                        {/* 3-Dot Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
                                title="More options"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                            {showMenu && (
                                <div className={`absolute top-1/2 -translate-y-1/2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 animate-slide-in ${isOwnMessage ? "-left-2 -translate-x-full mr-2" : "-right-2 translate-x-full ml-2"
                                    }`}>
                                    <button
                                        onClick={() => {
                                            onReply?.(message);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <MessageSquare size={14} /> Reply
                                    </button>
                                    {isOwnMessage && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onEdit?.(message);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this message?')) {
                                                        onDelete?.(message.id);
                                                    }
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </>
                                    )}
                                    {!isOwnMessage && (
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Report
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ wordBreak: 'break-word' }}>
                        {/* Don't show filename for audio messages */}
                        {message.type === 'audio' || message.message?.startsWith('voice-') ? null : message.message}
                    </div>

                    {/* File/Image/Video/Audio content */}
                    {message.file_path && renderFileContent()}

                    <div className={`mt-1 text-right text-[11px] ${isOwnMessage ? "text-teal-100" : "text-gray-400"}`}>
                        {time}
                    </div>
                </div>

            </div>
        </div>
    );
}
