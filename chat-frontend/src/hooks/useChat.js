import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { getEcho, connectSocket } from "../services/socket";

export function useChat(conversationId, onNewMessage) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [echoChannel, setEchoChannel] = useState(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);
  const isTypingRef = useRef(false);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await api.get(`/conversations/${conversationId}`);
      setConversation(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async (pageNumber = 1) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const response = await api.get(`/messages/${conversationId}?page=${pageNumber}&per_page=30`);

      const newMessages = response.data.data.reverse(); // Backend returns latest first, we want chronological

      if (pageNumber === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }

      setHasMore(response.data.current_page < response.data.last_page);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    // Initial fetch
    fetchConversation();
    fetchMessages(1);

    const echo = getEcho() || connectSocket();
    if (!echo) return;

    // Connect to Private WebSocket Channel
    const channel = echo.private(`chat.${conversationId}`);
    setEchoChannel(channel);

    channel
      .listen(".MessageSent", (e) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === e.message.id)) return prev;
          return [...prev, e.message];
        });
        if (onNewMessage) onNewMessage(e.message, conversationId);
      })
      .listen(".UserTyping", (e) => {
        if (e.is_typing) {
          setIsTyping(true);
          setTypingUser(e.user);

          // Auto-clear typing indicator after 3 seconds if no new typing event
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      })
      .listen(".UserStoppedTyping", (e) => {
        setIsTyping(false);
        setTypingUser(null);
      })
      .listen(".MessageDeleted", (e) => {
        setMessages((prev) => prev.filter(m => m.id !== e.message_id));
      });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (echoChannel) {
        echo.leave(`chat.${conversationId}`);
      }
    };
  }, [conversationId, fetchMessages, onNewMessage]);

  const sendTypingEvent = (isTypingStatus, user) => {
    if (!conversationId) return;

    const now = Date.now();

    // If user is typing
    if (isTypingStatus) {
      // Throttle API calls - max once every 2 seconds
      if (now - lastTypingTimeRef.current < 2000) {
        return;
      }

      lastTypingTimeRef.current = now;
      isTypingRef.current = true;

      // Send typing event
      api.post(`/conversations/${conversationId}/typing`, { is_typing: true })
        .catch(err => console.error("Failed to send typing event", err));

      // Clear any existing stop timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send stop typing event after 1.5 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          api.post(`/conversations/${conversationId}/stop-typing`)
            .catch(err => console.error("Failed to send stop typing event", err));
        }
      }, 1500);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return null;

    // Clear typing state when sending message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;

    try {
      // Optimistic update could go here, but for simplicity we rely on API response
      const response = await api.post("/messages", {
        conversation_id: conversationId,
        message: text,
      });

      setMessages((prev) => {
        if (prev.some(m => m.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      if (onNewMessage) onNewMessage(response.data, conversationId);
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    if (!messageId || !conversationId) return;

    // Optimistic deletion
    setMessages((prev) => prev.filter(m => m.id !== messageId));

    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const sendFile = async (file, onProgress) => {
    if (!file || !conversationId) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    try {
      const response = await api.post("/messages/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percentCompleted);
        },
      });

      setMessages((prev) => {
        if (prev.some(m => m.id === response.data.message.id)) return prev;
        return [...prev, response.data.message];
      });
      if (onNewMessage) onNewMessage(response.data.message, conversationId);
      return response.data;
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(page + 1);
    }
  };

  return { conversation, messages, loading, hasMore, sendMessage, sendFile, loadMore, isTyping, typingUser, sendTypingEvent, deleteMessage };
}
