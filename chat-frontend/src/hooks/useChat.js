import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import { connectSocket, getSocket } from "../services/socket";

const MESSAGE_PAGE_SIZE = 20;

const extractData = (payload) =>
  Array.isArray(payload) ? payload : payload?.data ?? [];

const extractNextPage = (payload) =>
  Array.isArray(payload) ? null : payload?.next_page_url ?? null;

const normalizeMessage = (raw) => ({
  id: Number(raw.id),
  conversation_id: Number(raw.conversation_id),
  sender_id: Number(raw.sender_id),
  message: raw.message ?? "",
  type: raw.type ?? "text",
  seen: Boolean(raw.seen),
  created_at: raw.created_at ?? new Date().toISOString(),
  sender: raw.sender ?? null,
});

const mergeMessages = (current, incoming) => {
  const deduped = new Map();

  [...current, ...incoming].forEach((message) => {
    deduped.set(message.id, message);
  });

  return [...deduped.values()].sort((a, b) => a.id - b.id);
};

export default function useChat({ token, currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [error, setError] = useState("");
  const typingTimersRef = useRef({});

  const clearTypingTimeout = useCallback((userId) => {
    if (typingTimersRef.current[userId]) {
      clearTimeout(typingTimersRef.current[userId]);
      delete typingTimersRef.current[userId];
    }
  }, []);

  const loadConversations = useCallback(async () => {
    if (!token) {
      return [];
    }

    setConversationsLoading(true);
    setError("");

    try {
      const response = await api.get("/conversations", {
        params: { per_page: 50 },
      });

      const conversationList = extractData(response.data);
      setConversations(conversationList);
      return conversationList;
    } catch {
      setError("Could not load conversations.");
      return [];
    } finally {
      setConversationsLoading(false);
    }
  }, [token]);

  const loadMessages = useCallback(
    async (conversationId, page = 1, prepend = false) => {
      if (!token || !conversationId) {
        return;
      }

      if (prepend) {
        setLoadingOlder(true);
      } else {
        setMessagesLoading(true);
      }

      setError("");

      try {
        const response = await api.get(`/messages/${conversationId}`, {
          params: { page, per_page: MESSAGE_PAGE_SIZE },
        });

        const pageMessages = extractData(response.data)
          .map(normalizeMessage)
          .reverse();

        if (prepend) {
          setMessages((previous) => mergeMessages(previous, pageMessages));
        } else {
          setMessages(pageMessages);
        }

        setMessagePage(page);
        setHasMoreMessages(Boolean(extractNextPage(response.data)));
      } catch {
        setError("Could not load messages.");
      } finally {
        if (prepend) {
          setLoadingOlder(false);
        } else {
          setMessagesLoading(false);
        }
      }
    },
    [token],
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!selectedConversation?.id) {
        return false;
      }

      const trimmed = text.trim();

      if (!trimmed) {
        return false;
      }

      setSendingMessage(true);
      setError("");

      try {
        const response = await api.post("/messages", {
          conversation_id: selectedConversation.id,
          message: trimmed,
          type: "text",
        });

        const saved = normalizeMessage(response.data);
        setMessages((previous) => mergeMessages(previous, [saved]));
        await loadConversations();
        return true;
      } catch {
        setError("Message was not sent.");
        return false;
      } finally {
        setSendingMessage(false);
      }
    },
    [selectedConversation?.id, loadConversations],
  );

  const emitTyping = useCallback(
    (isTyping) => {
      if (!selectedConversation?.id) {
        return;
      }

      void api
        .post(`/conversations/${selectedConversation.id}/typing`, {
          is_typing: isTyping,
        })
        .catch(() => {
          // Silent failure for typing indicator.
        });
    },
    [selectedConversation?.id],
  );

  const searchUsers = useCallback(
    async (query) => {
      const normalized = query.trim();

      if (normalized.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);

      try {
        const response = await api.get("/search-users", {
          params: { q: normalized, per_page: 8 },
        });

        const users = extractData(response.data).filter(
          (user) => Number(user.id) !== Number(currentUser?.id),
        );

        setSearchResults(users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [currentUser?.id],
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  const startConversation = useCallback(
    async (participantId) => {
      try {
        const response = await api.post("/conversations", {
          participant_id: participantId,
        });

        const conversation = response.data;
        setSelectedConversation(conversation);
        await loadConversations();
        await loadMessages(conversation.id);
        return conversation;
      } catch {
        setError("Could not start conversation.");
        return null;
      }
    },
    [loadConversations, loadMessages],
  );

  const loadOlderMessages = useCallback(() => {
    if (
      !selectedConversation?.id ||
      !hasMoreMessages ||
      loadingOlder ||
      messagesLoading
    ) {
      return;
    }

    void loadMessages(selectedConversation.id, messagePage + 1, true);
  }, [
    selectedConversation?.id,
    hasMoreMessages,
    loadingOlder,
    messagesLoading,
    loadMessages,
    messagePage,
  ]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadConversations();
  }, [token, loadConversations]);

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      setMessagePage(1);
      setHasMoreMessages(false);
      return;
    }

    void loadMessages(selectedConversation.id, 1, false);
  }, [selectedConversation?.id, loadMessages]);

  useEffect(() => {
    if (!selectedConversation?.id) {
      return;
    }

    const updated = conversations.find(
      (conversation) => Number(conversation.id) === Number(selectedConversation.id),
    );

    if (updated && updated !== selectedConversation) {
      setSelectedConversation(updated);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const echo = getSocket() ?? connectSocket(token);
    if (!echo) {
      return;
    }

    echo
      .join("online")
      .here((users) => {
        setOnlineUserIds(users.map((user) => Number(user.id)));
      })
      .joining((user) => {
        const userId = Number(user.id);
        setOnlineUserIds((previous) =>
          previous.includes(userId) ? previous : [...previous, userId],
        );
      })
      .leaving((user) => {
        const userId = Number(user.id);
        setOnlineUserIds((previous) => previous.filter((id) => id !== userId));
      });

    return () => {
      echo.leave("online");
    };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedConversation?.id) {
      return;
    }

    const conversationId = Number(selectedConversation.id);
    const echo = getSocket() ?? connectSocket(token);

    if (!echo) {
      return;
    }

    const channel = echo.private(`chat.${conversationId}`);

    const onMessage = (event) => {
      if (!event?.message) {
        return;
      }

      const incoming = normalizeMessage(event.message);

      if (incoming.conversation_id !== conversationId) {
        return;
      }

      setMessages((previous) => mergeMessages(previous, [incoming]));
      void loadConversations();
    };

    const onTyping = (event) => {
      if (!event) {
        return;
      }

      const userId = Number(event.user_id);

      if (!userId || userId === Number(currentUser?.id)) {
        return;
      }

      if (event.is_typing) {
        setTypingUserIds((previous) =>
          previous.includes(userId) ? previous : [...previous, userId],
        );

        clearTypingTimeout(userId);
        typingTimersRef.current[userId] = setTimeout(() => {
          setTypingUserIds((previous) => previous.filter((id) => id !== userId));
          clearTypingTimeout(userId);
        }, 1400);
      } else {
        setTypingUserIds((previous) => previous.filter((id) => id !== userId));
        clearTypingTimeout(userId);
      }
    };

    channel.listen("MessageSent", onMessage);
    channel.listen("UserTyping", onTyping);

    return () => {
      channel.stopListening("MessageSent", onMessage);
      channel.stopListening("UserTyping", onTyping);
      echo.leaveChannel(`private-chat.${conversationId}`);
    };
  }, [
    token,
    selectedConversation?.id,
    currentUser?.id,
    loadConversations,
    clearTypingTimeout,
  ]);

  useEffect(() => {
    Object.values(typingTimersRef.current).forEach(clearTimeout);
    typingTimersRef.current = {};
    setTypingUserIds([]);
  }, [selectedConversation?.id]);

  const onlineUserLookup = useMemo(
    () => new Set(onlineUserIds),
    [onlineUserIds],
  );

  return {
    conversations,
    conversationsLoading,
    selectedConversation,
    setSelectedConversation,
    messages,
    messagesLoading,
    loadingOlder,
    hasMoreMessages,
    sendingMessage,
    typingUserIds,
    onlineUserLookup,
    error,
    searchResults,
    searchLoading,
    loadConversations,
    loadOlderMessages,
    sendMessage,
    emitTyping,
    searchUsers,
    clearSearch,
    startConversation,
  };
}
