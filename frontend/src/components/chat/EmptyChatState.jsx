import { MessageSquarePlus, Sparkles, Globe2 } from "lucide-react";
import { useChat } from "../../context/ChatContext";

export default function EmptyChatState() {
  const { setShowNewChatModal } = useChat();

  return (
    <div className="empty-chat-state">
      <div className="empty-state-icon-box">
        <Globe2 size={36} />
      </div>

      <div style={{ maxWidth: 380, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)" }}>
          Polyglot Chat
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Select an active conversation from the sidebar or start a new multilingual discussion. Speak in your language, be understood in theirs.
        </p>
      </div>

      <button
        onClick={() => setShowNewChatModal(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-bubble-sent)",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: "var(--radius-full)",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 4px 14px var(--primary-glow)",
        }}
      >
        <MessageSquarePlus size={16} />
        <span>Start New Conversation</span>
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 12,
        }}
      >
        <Sparkles size={12} color="var(--primary-light)" />
        <span>Supports 11 Indian & International languages with instant AI translation</span>
      </div>
    </div>
  );
}
