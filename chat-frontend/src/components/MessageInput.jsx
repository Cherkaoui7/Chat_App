import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Mic, StopCircle, SendHorizonal } from "lucide-react";
import EmojiPickerComponent from "./EmojiPicker";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export default function MessageInput({ onSendMessage, onSendFile, onTyping, conversationId, replyToMessage, onClearReply, editingMessage, onClearEdit }) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize text when editing
    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.message);
        }
    }, [editingMessage]);

    const {
        isRecording,
        audioUrl,
        recordingTime,
        audioLevel,
        startRecording,
        stopRecording,
        cancelRecording,
        clearAudio,
        sendAudio,
        formatTime,
    } = useAudioRecorder();

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSendFile = async () => {
        if (!selectedFile || !onSendFile || isSending) return;

        setIsSending(true);
        setUploadProgress(0);
        try {
            await onSendFile(selectedFile, (progress) => setUploadProgress(progress));
            setSelectedFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("File upload error:", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendAudio = async () => {
        if (!audioUrl || !onSendFile || isSending) return;

        setIsSending(true);
        setUploadProgress(0);
        try {
            await sendAudio(conversationId, (progress) => setUploadProgress(progress));
        } catch (err) {
            console.error("Audio send error:", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!text.trim() && !selectedFile) || isSending) return;

        setIsSending(true);
        try {
            if (editingMessage) {
                // Edit message - for now just send as new message (you can add edit API later)
                await onSendMessage(text);
                onClearEdit?.();
            } else {
                await onSendMessage(text);
            }
            setText("");
            onClearReply?.();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };


    const handleEmojiClick = (emoji) => {
        setText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎬';
        if (file.type.startsWith('audio/')) return '🎵';
        if (file.type.includes('pdf')) return '📄';
        if (file.type.includes('word')) return '📝';
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
        return '📁';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            {/* File preview */}
            {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(selectedFile)}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setSelectedFile(null);
                            setUploadProgress(0);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    {uploadProgress === 0 && (
                        <button
                            onClick={handleSendFile}
                            disabled={isSending}
                            className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                        >
                            Send
                        </button>
                    )}
                </div>
            )}

            {/* Audio preview */}
            {audioUrl && !isRecording && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Mic size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <audio src={audioUrl} controls className="h-8 w-full" />
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">{formatTime(recordingTime)}</span>
                    <button
                        onClick={clearAudio}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={handleSendAudio}
                        disabled={isSending}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Send"
                    >
                        <SendHorizonal size={20} />
                    </button>
                </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
                <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
                    <div className="relative shrink-0">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <div
                            className="absolute inset-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping"
                            style={{ animationDuration: '1.5s' }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-red-700">Recording</span>
                            <span className="text-sm text-red-600 font-mono">{formatTime(recordingTime)}</span>
                        </div>
                        {/* Audio level visualization */}
                        <div className="flex items-center gap-0.5 mt-1.5 h-3">
                            {[...Array(15)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-400 rounded-full transition-all duration-75"
                                    style={{
                                        height: `${Math.max(3, Math.random() * audioLevel * 100)}%`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={stopRecording}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shrink-0"
                        title="Stop recording"
                    >
                        <StopCircle size={22} />
                    </button>
                    <button
                        onClick={cancelRecording}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        title="Cancel recording"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Reply preview */}
            {replyToMessage && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-indigo-600">
                                {replyToMessage.sender_id === user?.id ? 'Replying to yourself' : 'Replying to ' + (replyToMessage.sender?.name || 'user')}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-0.5">{replyToMessage.message}</p>
                        </div>
                        <button
                            onClick={onClearReply}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Edit indicator */}
            {editingMessage && (
                <div className="mb-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-yellow-700">Editing message</p>
                        </div>
                        <button
                            onClick={onClearEdit}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                />

                {/* File attachment button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
                    title="Attach file"
                >
                    <Paperclip size={20} />
                </button>

                {/* Emoji picker button */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors shrink-0"
                        title="Add emoji"
                    >
                        <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                        <EmojiPickerComponent
                            onEmojiClick={handleEmojiClick}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>

                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-[24px] px-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (onTyping) onTyping(true);
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-2 py-3 focus:outline-none text-[15px] text-gray-800 placeholder-gray-400"
                        disabled={isSending || isRecording}
                    />
                </div>

                {/* Voice message button */}
                {!text.trim() ? (
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors shadow-sm ${isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}
                        title={isRecording ? "Stop recording" : "Voice message"}
                    >
                        {isRecording ? <StopCircle size={20} /> : <Mic size={18} />}
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isSending}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                )}
            </form>
        </div>
    );
}
