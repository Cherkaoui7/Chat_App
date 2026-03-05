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
        setMessages((prev) => [...prev, e.message]);
        if (onNewMessage) onNewMessage(e.message, conversationId);
      })
      .listen(".UserTyping", (e) => {
        if (e.is_typing) {
          setIsTyping(true);
          setTypingUser(e.user);

          // Clear the typing indicator after 3 seconds of no new typing events
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      });

    return () => {
      echo.leave(`chat.${conversationId}`);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, fetchMessages, onNewMessage]);

  const sendTypingEvent = (isTypingStatus, user) => {
    if (!conversationId) return;

    const now = Date.now();
    // Throttle typing API triggers to max once every 2 seconds
    if (isTypingStatus && now - lastTypingTimeRef.current < 2000) {
      return;
    }

    lastTypingTimeRef.current = now;
    api.post(`/conversations/${conversationId}/typing`, { is_typing: isTypingStatus })
      .catch(err => console.error("Failed to send typing event", err));
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return null;

    try {
      // Optimistic update could go here, but for simplicity we rely on API response
      const response = await api.post("/messages", {
        conversation_id: conversationId,
        message: text,
      });

      setMessages((prev) => [...prev, response.data]);
      if (onNewMessage) onNewMessage(response.data, conversationId);
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(page + 1);
    }
  };

  return { conversation, messages, loading, hasMore, sendMessage, loadMore, isTyping, typingUser, sendTypingEvent };
}
