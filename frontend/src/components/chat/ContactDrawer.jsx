import { X, Globe, FileText, Bell, Shield, UserCheck, Download } from "lucide-react";
import Avatar from "../common/Avatar";
import LanguageSelector from "../common/LanguageSelector";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { MOCK_SHARED_MEDIA, MOCK_SHARED_FILES, MOCK_USERS } from "../../data/mockData";
import { getLanguageByCode } from "../../constants/languages";

export default function ContactDrawer() {
  const { activeConversation, showContactDrawer, setShowContactDrawer } = useChat();
  const { currentUser, updatePreferredLanguage, switchMockUser } = useAuth();

  if (!showContactDrawer || !activeConversation) return null;

  const { participant } = activeConversation;
  const partnerLang = getLanguageByCode(participant.preferredLanguage);

  return (
    <aside className="contact-details-drawer" aria-label="Contact Details">
      <div className="drawer-header">
        <h3 className="drawer-title">Contact Info</h3>
        <button
          className="action-icon-btn"
          onClick={() => setShowContactDrawer(false)}
          aria-label="Close contact details"
        >
          <X size={18} />
        </button>
      </div>

      <div className="drawer-content">
        {/* Profile Card */}
        <div className="contact-profile-card">
          <Avatar
            src={participant.avatar}
            name={participant.username}
            size={88}
            online={participant.online}
          />
          <h4 className="drawer-contact-name">{participant.username}</h4>
          <p className="drawer-contact-bio">{participant.bio || "Polyglot Chat member"}</p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              background: participant.online
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              color: participant.online ? "var(--accent-emerald)" : "var(--text-muted)",
              border: `1px solid ${participant.online ? "rgba(16, 185, 129, 0.3)" : "var(--border-subtle)"}`,
            }}
          >
            {participant.online ? "Online Now" : participant.lastSeen}
          </span>
        </div>

        {/* Translation Preferences Card */}
        <div>
          <div className="drawer-section-heading">Translation Settings</div>
          <div className="language-selector-box">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Contact's native language:
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                {partnerLang.flag} {partnerLang.name}
              </span>
            </div>

            <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />

            <LanguageSelector
              label="Your Preferred Language (Auto-Translate to)"
              value={currentUser?.preferredLanguage || "en"}
              onChange={(code) => updatePreferredLanguage(code)}
            />

            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
              Incoming messages from {participant.username} will be translated to your preferred language with AI, while their original text remains 100% accessible.
            </p>
          </div>
        </div>

        {/* Shared Media Section (Screenshots 1 & 2) */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span className="drawer-section-heading" style={{ margin: 0 }}>
              Shared Media (14)
            </span>
            <button
              onClick={() => alert("Viewing all 14 shared photos")}
              style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600 }}
            >
              View all
            </button>
          </div>

          <div className="media-grid-preview">
            {MOCK_SHARED_MEDIA.map((item, idx) => (
              <div key={item.id} className="media-thumbnail-card">
                <img src={item.url} alt={item.title} />
                {idx === 3 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.65)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    +11
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shared Files Section (Screenshot 2) */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span className="drawer-section-heading" style={{ margin: 0 }}>
              Shared Files (3)
            </span>
            <button
              onClick={() => alert("Viewing all documents")}
              style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600 }}
            >
              View all
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_SHARED_FILES.map((file) => (
              <div
                key={file.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: varRadiusSm(),
                      background: "rgba(124, 58, 237, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-light)",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {file.ext} • {file.size}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloading ${file.name}`)}
                  style={{ color: "var(--text-secondary)", padding: 4 }}
                  title="Download file"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Switcher: Test as another user */}
        <div>
          <div className="drawer-section-heading">Demo Persona Switcher</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Switch perspectives to test multilingual conversation dynamics:
            </p>
            {MOCK_USERS.slice(0, 3).map((u) => (
              <button
                key={u.id}
                onClick={() => switchMockUser(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: currentUser?.id === u.id ? "var(--bg-sidebar-active)" : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${currentUser?.id === u.id ? "var(--border-glow)" : "var(--border-subtle)"}`,
                  color: "var(--text-main)",
                  fontSize: 12,
                  textAlign: "left",
                }}
              >
                <UserCheck size={14} color={currentUser?.id === u.id ? "var(--accent-emerald)" : "var(--text-muted)"} />
                <span>Simulate as {u.username} ({u.preferredLanguage.toUpperCase()})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Encryption */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "#6ee7b7",
          }}
        >
          <Shield size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>End-to-End Multilingual Privacy</strong>
            <p style={{ fontSize: 11, opacity: 0.9 }}>
              Translations run through isolated translation nodes. Original text is never altered or truncated.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function varRadiusSm() {
  return "8px";
}
