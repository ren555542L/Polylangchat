import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES_MAP,
  MOCK_USERS,
} from "../data/mockData";
import { useAuth } from "./AuthContext";
import { socketService } from "../services/socket";
import { api } from "../services/api";

const ChatContext = createContext(null);

function reconcileMessage(messages, rawMessage, currentUserId) {
  const serverId = String(rawMessage._id || rawMessage.id);
  const conversationId = String(rawMessage.conversationId);
  const senderId = String(rawMessage.senderId);
  const originalText = rawMessage.originalText ?? rawMessage.text ?? "";

  const normalizedMessage = {
    ...rawMessage,
    id: serverId,
    _id: serverId,
    conversationId,
    senderId,
    originalText,
    text: originalText,
    status: "sent",
  };

  // If the server message already exists, update it.
  const existingIndex = messages.findIndex(
    (message) => String(message._id || message.id) === serverId,
  );

  if (existingIndex !== -1) {
    return messages.map((message, index) =>
      index === existingIndex ? { ...message, ...normalizedMessage } : message,
    );
  }

  // Otherwise replace the matching optimistic message.
  const optimisticIndex = messages.findIndex(
    (message) =>
      String(message.conversationId) === conversationId &&
      String(message.senderId) === senderId &&
      String(message.senderId) === String(currentUserId) &&
      message.status === "sending" &&
      (message.originalText ?? message.text) === originalText,
  );

  if (optimisticIndex !== -1) {
    return messages.map((message, index) =>
      index === optimisticIndex
        ? { ...message, ...normalizedMessage }
        : message,
    );
  }

  // This is a genuinely new incoming message.
  return [...messages, normalizedMessage];
}

export const ChatProvider = ({ children }) => {
  const { currentUser, token, isMockMode } = useAuth();

  const [conversations, setConversations] = useState(
    isMockMode ? MOCK_CONVERSATIONS : [],
  );
  const [activeConversationId, setActiveConversationId] = useState(
    isMockMode ? "conv_001" : null,
  );
  const [messagesMap, setMessagesMap] = useState(
    isMockMode ? MOCK_MESSAGES_MAP : {},
  );
  const [revealedOriginals, setRevealedOriginals] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'unread' | 'pinned'
  const [showContactDrawer, setShowContactDrawer] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    isMockMode ? "mock" : "connected",
  );
  const [composerLanguage, setComposerLanguage] = useState(
    currentUser?.preferredLanguage || "en",
  );
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Sync composer language with user's preferred language when user changes
  useEffect(() => {
    if (currentUser?.preferredLanguage) {
      setComposerLanguage(currentUser.preferredLanguage);
    }
  }, [currentUser?.preferredLanguage]);
  // Load real conversations and message history in live mode.
  useEffect(() => {
    if (isMockMode || !token) return;

    let cancelled = false;

    const loadConversations = async () => {
      try {
        const data = await api.getConversations(token);

        const normalizedConversations = (data.conversations || [])
          .filter((conv) => conv.participant)
          .map((conv) => ({
            ...conv,
            id: String(conv.id),
            participant: {
              ...conv.participant,
              id: String(conv.participant.id),
            },
            lastMessage: conv.lastMessage
              ? {
                  ...conv.lastMessage,
                  text:
                    conv.lastMessage.text ||
                    conv.lastMessage.originalText ||
                    "",
                  translatedText: null,
                  timestamp: conv.lastMessage.createdAt,
                  isSelf:
                    String(conv.lastMessage.senderId) ===
                    String(currentUser?.id),
                }
              : {
                  text: `Conversation with ${conv.participant.username}`,
                  translatedText: null,
                  sourceLanguage: "en",
                  timestamp: conv.updatedAt || conv.createdAt,
                  isSelf: false,
                },
            unreadCount: 0,
            pinned: false,
          }));

        const histories = await Promise.all(
          normalizedConversations.map(async (conv) => {
            const result = await api.getMessages(token, conv.id);

            const normalizedMessages = (result.messages || []).map((msg) => ({
              ...msg,
              id: String(msg._id),
              _id: String(msg._id),
              conversationId: String(msg.conversationId),
              senderId: String(msg.senderId),
              text: msg.originalText,
            }));

            return [conv.id, normalizedMessages];
          }),
        );

        if (cancelled) return;

        setConversations(normalizedConversations);
        setMessagesMap(Object.fromEntries(histories));

        setActiveConversationId((previousId) => {
          if (
            previousId &&
            normalizedConversations.some((conv) => conv.id === previousId)
          ) {
            return previousId;
          }

          return normalizedConversations[0]?.id ?? null;
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load conversations:", error);
          setConnectionStatus("offline");
        }
      }
    };

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [isMockMode, token, currentUser?.id]);
  // Connect socket if live mode and wire up status + message listeners.
  //
  // IMPORTANT: This effect must NOT call socketService.disconnect() on
  // cleanup — the socket must survive re-renders and dependency changes so
  // that Socket.IO's built-in auto-reconnection keeps running.  We only
  // remove the React-side handler callbacks; the underlying low-level
  // socket.on() listeners registered inside socketService.connect() remain
  // active for the lifetime of the singleton.
  useEffect(() => {
    if (isMockMode || !token) {
      setConnectionStatus(isMockMode ? "mock" : "offline");
      return;
    }

    try {
      socketService.connect(token);
      setConnectionStatus(
        socketService.isConnected() ? "connected" : "reconnecting",
      );

      const unbindConnect = socketService.onConnect(() => {
        setConnectionStatus("connected");
      });

      const unbindDisconnect = socketService.onDisconnect((reason) => {
        console.log("[ChatContext] Socket disconnected:", reason);
        // "io server disconnect" is an intentional server-side kick —
        // mark offline.  All other reasons (transport errors, ping
        // timeouts, etc.) are transient; show "reconnecting" so the UI
        // accurately reflects that Socket.IO is retrying automatically.
        if (reason === "io server disconnect") {
          setConnectionStatus("offline");
        } else {
          setConnectionStatus("reconnecting");
        }
      });

      const unbindReconnect = socketService.onReconnect(() => {
        setConnectionStatus("connected");
      });

      const unbindError = socketService.onError(() => {
        // Only update status if currently showing "connected" — transient
        // errors during reconnection should stay as "reconnecting".
        setConnectionStatus((prev) =>
          prev === "connected" ? "reconnecting" : prev,
        );
      });

      // Capture the user id at registration time so the closure is stable.
      const userId = currentUser?.id;
      // ── DIAGNOSTIC LOG ───────────────────────────────────────────────
      console.log("[onMessageNew] Registering handler. userId:", userId,
        "| handler set size before:", socketService.handlers.messageNew.size);
      // ────────────────────────────────────────────────────────────────
      const unbindMessageNew = socketService.onMessageNew((newMsg) => {
        // ── DIAGNOSTIC LOG ─────────────────────────────────────────────
        console.log("[onMessageNew] FIRED", {
          msgId: newMsg._id || newMsg.id,
          senderId: newMsg.senderId,
          myUserId: userId,
          isSelf: String(newMsg.senderId) === String(userId),
          conversationId: newMsg.conversationId,
          text: newMsg.originalText,
          handlerSetSize: socketService.handlers.messageNew.size,
        });
        // ──────────────────────────────────────────────────────────────
        // The server broadcasts message:new to the whole room including the
        // sender.  Ignore own echoes here — the acknowledgement callback in
        // sendMessage() already reconciles the optimistic message.
        if (String(newMsg.senderId) === String(userId)) {
          return;
        }
        setMessagesMap((prev) => {
          const conversationId = String(newMsg.conversationId);
          const convMsgs = prev[conversationId] || [];

          return {
            ...prev,
            [conversationId]: reconcileMessage(convMsgs, newMsg, userId),
          };
        });
      });

      const unbindMessageTranslation = socketService.onMessageTranslation(
        (trans) => {
          setMessagesMap((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((convId) => {
              updated[convId] = updated[convId].map((m) => {
                if (m._id === trans.messageId || m.id === trans.messageId) {
                  return {
                    ...m,
                    translation: {
                      targetLanguage: trans.targetLanguage,
                      translatedText: trans.translatedText,
                      translationStatus: trans.translationStatus,
                    },
                  };
                }
                return m;
              });
            });
            return updated;
          });
        },
      );

      return () => {
        unbindConnect();
        unbindDisconnect();
        unbindReconnect();
        unbindError();
        unbindMessageNew();
        unbindMessageTranslation();
        // Do NOT call socketService.disconnect() here — that would kill
        // auto-reconnection on every token/user change and every React
        // Strict-Mode double-invoke.
      };
    } catch {
      setConnectionStatus("offline");
    }
  }, [isMockMode, token, currentUser?.id]);
  // Join (or re-join) the active conversation room.
  //
  // We must re-join after every successful auto-reconnect because the
  // server-side socket is a brand-new object after each reconnect and has
  // no room memberships from the previous session.
  useEffect(() => {
    if (isMockMode || !token || !activeConversationId) return;

    let cancelled = false;

    const joinRoom = async () => {
      if (cancelled) return;
      try {
        await socketService.joinConversation(activeConversationId);
        if (!cancelled) {
          console.log("[ChatContext] Joined room:", activeConversationId);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[ChatContext] Failed to join room:", error.message);
        }
      }
    };

    // Join immediately if already connected.
    if (socketService.isConnected()) {
      joinRoom();
    }

    // Also join whenever the socket connects (initial connect) OR reconnects
    // after a network interruption.  Both events are propagated by the
    // service's handler Sets so cleanup is symmetrical.
    const unbindConnect = socketService.onConnect(joinRoom);
    const unbindReconnect = socketService.onReconnect(joinRoom);

    return () => {
      cancelled = true;
      unbindConnect();
      unbindReconnect();
    };
  }, [isMockMode, token, activeConversationId]);
  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ||
      conversations[0]
    );
  }, [conversations, activeConversationId]);

  const activeMessages = useMemo(() => {
    return messagesMap[activeConversationId] || [];
  }, [messagesMap, activeConversationId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        (conv.participant?.username || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.text || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterTab === "unread") return conv.unreadCount > 0;
      if (filterTab === "pinned") return conv.pinned;
      return true;
    });
  }, [conversations, searchQuery, filterTab]);

  const toggleRevealOriginal = useCallback((messageId) => {
    setRevealedOriginals((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  }, []);

  const sendMessage = async ({ text, sourceLanguage = composerLanguage }) => {
    if (!text.trim() || !activeConversation) return;

    const trimmed = text.trim();
    // ── DIAGNOSTIC LOG (remove after Bug B is confirmed fixed) ──────────
    console.log("[sendMessage] CALLED", {
      caller: new Error().stack?.split("\n")[2]?.trim(),
      isMockMode,
      senderId: currentUser?.id,
      conversationId: activeConversation?.id,
      text: trimmed,
      socketConnected: socketService.isConnected(),
      handlerCount: socketService.handlers?.messageNew?.size,
      timestamp: new Date().toISOString(),
    });
    // ────────────────────────────────────────────────────────────────────
    setIsSending(true);

    const tempId = "msg_local_" + Date.now();
    const optimisticMessage = {
      _id: tempId,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      originalText: trimmed,
      sourceLanguage: sourceLanguage,
      createdAt: new Date().toISOString(),
      translation: null,
      status: "sending",
    };

    // Add optimistic message immediately
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [
        ...(prev[activeConversation.id] || []),
        optimisticMessage,
      ],
    }));

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: {
                text: trimmed,
                translatedText: null,
                sourceLanguage: sourceLanguage,
                timestamp: "Just now",
                isSelf: true,
              },
            }
          : c,
      ),
    );

    try {
      if (isMockMode) {
        // Mark as sent after a quick simulated tick
        setTimeout(() => {
          setMessagesMap((prev) => ({
            ...prev,
            [activeConversation.id]: (prev[activeConversation.id] || []).map(
              (m) => (m._id === tempId ? { ...m, status: "read" } : m),
            ),
          }));
        }, 500);

        // Realistic interactive simulation: After 1.8 seconds, contact responds in their native language
        setTimeout(() => {
          setIsTyping(true);
        }, 1200);

        setTimeout(() => {
          setIsTyping(false);
          const contact = activeConversation.participant;
          const replyData = getMockReply(contact.preferredLanguage, trimmed);

          const incomingMsg = {
            _id: "msg_sim_" + Date.now(),
            conversationId: activeConversation.id,
            senderId: contact.id,
            originalText: replyData.original,
            sourceLanguage: contact.preferredLanguage,
            createdAt: new Date().toISOString(),
            translation: {
              targetLanguage: currentUser?.preferredLanguage || "en",
              translatedText: replyData.translated,
              translationStatus: "completed",
              modelName: "ai4bharat/indictrans2-en-indic-dist-200M",
            },
          };

          setMessagesMap((prev) => ({
            ...prev,
            [activeConversation.id]: [
              ...(prev[activeConversation.id] || []),
              incomingMsg,
            ],
          }));

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    lastMessage: {
                      text: replyData.original,
                      translatedText: replyData.translated,
                      sourceLanguage: contact.preferredLanguage,
                      timestamp: "Just now",
                      isSelf: false,
                    },
                  }
                : c,
            ),
          );
        }, 3200);
      } else {
        // Live backend integration.
        // If the socket is not connected, fail fast and mark as error so
        // the user can see it failed rather than waiting indefinitely.
        if (!socketService.isConnected()) {
          throw new Error("Not connected — message not sent");
        }

        const response = await socketService.sendMessage({
          conversationId: activeConversation.id,
          originalText: trimmed,
          sourceLanguage,
        });

        if (!response?.ok || !response.message) {
          throw new Error(
            response?.error || "Message was not confirmed by the server",
          );
        }

        const confirmedMessage = response.message;
        setMessagesMap((prev) => {
          const conversationId = String(confirmedMessage.conversationId);
          const convMsgs = prev[conversationId] || [];

          return {
            ...prev,
            [conversationId]: reconcileMessage(
              convMsgs,
              confirmedMessage,
              currentUser?.id,
            ),
          };
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m._id === tempId ? { ...m, status: "error" } : m,
        ),
      }));
    } finally {
      setIsSending(false);
    }
  };

  const createNewConversation = (user) => {
    // Check if conversation already exists
    const existing = conversations.find((c) => c.participant.id === user.id);
    if (existing) {
      setActiveConversationId(existing.id);
      setShowNewChatModal(false);
      return;
    }

    const newId = "conv_" + Date.now();
    const newConv = {
      id: newId,
      participant: user,
      lastMessage: {
        text: `Conversation started with ${user.username}`,
        translatedText: null,
        sourceLanguage: "en",
        timestamp: "Just now",
        isSelf: false,
      },
      unreadCount: 0,
      pinned: false,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [newId]: [],
    }));
    setActiveConversationId(newId);
    setShowNewChatModal(false);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations: filteredConversations,
        allConversations: conversations,
        activeConversation,
        activeConversationId,
        setActiveConversationId,
        activeMessages,
        revealedOriginals,
        toggleRevealOriginal,
        sendMessage,
        searchQuery,
        setSearchQuery,
        filterTab,
        setFilterTab,
        showContactDrawer,
        setShowContactDrawer,
        isTyping,
        connectionStatus,
        composerLanguage,
        setComposerLanguage,
        showNewChatModal,
        setShowNewChatModal,
        createNewConversation,
        isSending,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Helper to provide realistic contextual multilingual responses for demo
function getMockReply(langCode, query) {
  const replies = {
    hi: {
      original:
        "बिल्कुल! मैं इस पर काम कर रहा हूँ। सब कुछ समय पर पूरा हो जाएगा।",
      translated:
        "Absolutely! I am working on this. Everything will be completed on time.",
    },
    ta: {
      original: "நிச்சயமாக! திட்டத்தின் பணிகள் மிகச் சிறப்பாக நடைபெறுகின்றன.",
      translated: "Certainly! The project work is progressing very smoothly.",
    },
    te: {
      original: "ఖచ్చితంగా! మేము దీనిని పరిశీలించి వెంటనే అప్‌డేట్ చేస్తాము.",
      translated: "Definitely! We will examine this and update immediately.",
    },
    bn: {
      original: "হ্যাঁ, দারুণ আইডিয়া! আমি প্রয়োজনীয় ফাইলগুলো এখনই পাঠাচ্ছি।",
      translated:
        "Yes, great idea! I am sending the necessary files right away.",
    },
    gu: {
      original: "ચોક્કસ, આપણે આવતીકાલે આની સમીક્ષા કરી શકીએ છીએ.",
      translated: "Sure, we can review this tomorrow.",
    },
    mr: {
      original: "नक्कीच! नवीन वैशिष्ट्ये खूप छान दिसत आहेत.",
      translated: "Sure! The new features are looking very good.",
    },
    "hi-Latn": {
      original:
        "Bilkul sahi hai bro, main code review kar ke merge kar deta hoon!",
      translated:
        "That is totally right bro, I will review the code and merge it!",
    },
    en: {
      original:
        "Understood! Everything is synchronizing perfectly across our multilingual pipeline.",
      translated:
        "Understood! Everything is synchronizing perfectly across our multilingual pipeline.",
    },
  };

  return replies[langCode] || replies.hi;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
