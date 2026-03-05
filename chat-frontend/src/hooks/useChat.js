import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { getEcho, connectSocket } from "../services/socket";

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

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
    fetchMessages(1);

    const echo = getEcho() || connectSocket();
    if (!echo) return;

    // Listen to WebSocket
    const channel = echo.private(`chat.${conversationId}`)
      .listen("MessageSent", (e) => { // NOTE: .MessageSent with dot if not using full namespace in event broadcastAs
        setMessages((prev) => [...prev, e.message]);
      });

    return () => {
      echo.leave(`chat.${conversationId}`);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return null;

    try {
      // Optimistic update could go here, but for simplicity we rely on API response
      const response = await api.post("/messages", {
        conversation_id: conversationId,
        message: text,
      });

      setMessages((prev) => [...prev, response.data]);
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

  return { messages, loading, hasMore, sendMessage, loadMore };
}
