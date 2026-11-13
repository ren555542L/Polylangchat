import { ArrowLeft, Phone, Video, Search, Info } from "lucide-react";
import Avatar from "../common/Avatar";
import ConnectionStatusBadge from "../common/ConnectionStatusBadge";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getLanguageByCode } from "../../constants/languages";

export default function ChatHeader({ onBack }) {
  const {
    activeConversation,
    showContactDrawer,
    setShowContactDrawer,
    connectionStatus,
  } = useChat();
  const { currentUser, isMockMode, setIsMockMode } = useAuth();

  if (!activeConversation) return null;

  const { participant } = activeConversation;
  const userLang = getLanguageByCode(currentUser?.preferredLanguage || "en");
  const partnerLang = getLanguageByCode(participant?.preferredLanguage);

  return (
    <header className="chat-header">
      <div className="chat-contact-info">
        <button
          className="mobile-back-btn"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>

        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
          onClick={() => setShowContactDrawer(!showContactDrawer)}
        >
          <Avatar
            src={participant.avatar}
            name={participant.username}
            size={42}
            online={participant.online}
          />

          <div className="contact-name-status">
            <h3>{participant.username}</h3>
            <div className="contact-status-text">
              <span
                className="status-active-indicator"
                style={{
                  backgroundColor: participant.online
                    ? "var(--accent-emerald)"
                    : "var(--text-muted)",
                }}
              />
              <span>
                {participant.online ? "Online" : participant.lastSeen}
              </span>
              <span style={{ color: "var(--border-medium)" }}>•</span>
              <span style={{ color: "var(--text-muted)" }}>
                Native: {partnerLang.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <div
          className="translation-bridge-pill"
          title={`All messages received will be translated to your preferred language (${userLang.name})`}
        >
          <span>文</span>
          <span>Translates to {userLang.name}</span>
        </div>
        <ConnectionStatusBadge status={connectionStatus} />

        <button
          className="action-icon-btn"
          title="Search messages in this conversation"
          aria-label="Search messages"
          onClick={() => alert("Search within chat is active.")}
        >
          <Search size={18} />
        </button>

        <button
          className="action-icon-btn"
          title="Voice call"
          aria-label="Audio call"
          onClick={() => alert("Initiating voice call bridge...")}
        >
          <Phone size={18} />
        </button>

        <button
          className="action-icon-btn"
          title="Video call"
          aria-label="Video call"
          onClick={() => alert("Starting video call session...")}
        >
          <Video size={18} />
        </button>

        <button
          className={`action-icon-btn ${showContactDrawer ? "active" : ""}`}
          title="Toggle contact details"
          aria-label="Contact info"
          onClick={() => setShowContactDrawer(!showContactDrawer)}
        >
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}
