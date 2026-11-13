import { MessageSquare, Users, Phone, Bookmark, Settings, Home, LogOut } from "lucide-react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export default function LeftNavRail({ onOpenAuth, onGoHome }) {
  const { currentUser, logout, isMockMode, setIsMockMode } = useAuth();
  const { setShowNewChatModal, showContactDrawer, setShowContactDrawer } = useChat();

  return (
    <nav className="nav-rail" aria-label="Main Navigation">
      <div className="rail-brand">
        <button
          className="brand-icon"
          title="Polyglot Chat - Multilingual Realtime Messenger"
          onClick={onGoHome}
        >
          <span>P</span>
        </button>
      </div>

      <div className="rail-menu">
        <button
          className="rail-btn"
          title="Home / Landing Page"
          aria-label="Home"
          onClick={onGoHome}
        >
          <Home size={20} />
        </button>

        <button
          className="rail-btn active"
          title="Chats"
          aria-label="Chats"
        >
          <MessageSquare size={20} />
        </button>

        <button
          className="rail-btn"
          title="Contacts / New Conversation"
          aria-label="Contacts"
          onClick={() => setShowNewChatModal(true)}
        >
          <Users size={20} />
        </button>

        <button
          className="rail-btn"
          title="Calls (Audio/Video)"
          aria-label="Calls"
          onClick={() => alert("Real-time audio & video calls will be available soon.")}
        >
          <Phone size={20} />
        </button>

        <button
          className="rail-btn"
          title="Saved Translations"
          aria-label="Saved Translations"
          onClick={() => alert("Bookmarked and saved translation snippets.")}
        >
          <Bookmark size={20} />
        </button>
      </div>

      <div className="rail-bottom">
        <button
          className="rail-btn"
          title={isMockMode ? "Switch to Live Server Mode" : "Switch to Mock Demo Mode"}
          onClick={() => setIsMockMode(!isMockMode)}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isMockMode ? "var(--accent-cyan)" : "var(--accent-emerald)",
          }}
        >
          {isMockMode ? "MOCK" : "LIVE"}
        </button>

        <button
          className="rail-btn"
          title="Toggle Details / Settings"
          aria-label="Settings"
          onClick={() => setShowContactDrawer(!showContactDrawer)}
        >
          <Settings size={20} />
        </button>

        <div
          className="user-rail-avatar"
          title={`Logged in as ${currentUser?.username || "Guest"} • Click for account options`}
          onClick={onOpenAuth}
        >
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.username || "You"}
            size={38}
            online={true}
          />
        </div>
      </div>
    </nav>
  );
}
