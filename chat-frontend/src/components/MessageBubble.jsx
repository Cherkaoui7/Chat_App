import { format } from "date-fns";
import { SmilePlus, MoreHorizontal, Download, File, Image as ImageIcon, Video, Music, Mic, MessageSquare, Trash2, Edit2, Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import EmojiPickerComponent from "./EmojiPicker";

export default function MessageBubble({ message, isOwnMessage, showSenderName, onReply, onDelete, onEdit }) {
    const time = message.created_at ? format(new Date(message.created_at), "h:mm a") : "";
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const [isPlaying, setIsPlaying] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const menuRef = useRef(null);
    const emojiRef = useRef(null);
    const audioRef = useRef(null);

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle seek bar change
    const handleSeek = (e) => {
        if (audioRef.current) {
            const newTime = parseFloat(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

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

        // Audio / Voice message - WhatsApp style custom player
        if (message.type === 'audio' || message.type === 'voice' || 
            (message.type === 'video' && message.file_mime_type === 'video/webm') ||
            message.message?.startsWith('voice-')) {
            return (
                <div className="flex items-center gap-2 min-w-[220px]">
                    <audio
                        ref={audioRef}
                        src={fileUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                            setIsPlaying(false);
                            setCurrentTime(0);
                        }}
                        onTimeUpdate={() => {
                            if (audioRef.current) {
                                setCurrentTime(audioRef.current.currentTime);
                            }
                        }}
                        onLoadedMetadata={() => {
                            if (audioRef.current) {
                                setDuration(audioRef.current.duration);
                            }
                        }}
                    />
                    {/* Custom pill-shaped player */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full px-3 py-2">
                        {/* Play/Pause Button */}
                        <button
                            onClick={() => {
                                if (audioRef.current) {
                                    if (isPlaying) {
                                        audioRef.current.pause();
                                    } else {
                                        audioRef.current.play();
                                    }
                                }
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                            {isPlaying ? <Pause size={16} fill="#7c3aed" /> : <Play size={16} fill="#7c3aed" className="ml-0.5" />}
                        </button>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
                                style={{
                                    background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%)`
                                }}
                            />
                            <span className="text-xs text-white min-w-[38px] text-right">{formatTime(duration)}</span>
                        </div>

                        {/* Volume Icon */}
                        <Volume2 size={16} className="text-white flex-shrink-0" />
                    </div>
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

                {/* Voice Message - No container, just the player */}
                {message.type === 'audio' || message.type === 'voice' || 
                 (message.type === 'video' && message.file_mime_type === 'video/webm') ||
                 message.message?.startsWith('voice-') ? (
                    <div className="relative flex items-center gap-2">
                        {/* Timestamp */}
                        <span className="text-[11px] text-gray-400 mr-1">{time}</span>

                        {/* Hover Actions - 3-dot menu */}
                        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                    <div className="absolute right-full top-0 mr-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 animate-slide-in">
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

                        {/* Audio Player */}
                        {message.file_path && renderFileContent()}
                    </div>
                ) : (
                    /* Regular Message Bubble */
                    <div
                        className={`relative px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all ${
                            isOwnMessage
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

                    {/* Hover Actions - 3-dot menu positioned to the left */}
                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        isOwnMessage ? "-left-8" : "-right-8"
                    }`}>
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
                                <div className="absolute right-full top-0 mr-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 animate-slide-in">
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
                        {message.message}
                    </div>

                    {/* File/Image/Video/Audio content */}
                    {message.file_path && renderFileContent()}

                    <div className={`mt-1 text-right text-[11px] ${isOwnMessage ? "text-teal-100" : "text-gray-400"}`}>
                        {time}
                    </div>
                </div>
                )}

            </div>
        </div>
    );
}
