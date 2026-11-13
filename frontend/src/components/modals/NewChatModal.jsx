import { useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import Avatar from "../common/Avatar";
import { MOCK_USERS } from "../../data/mockData";
import { useChat } from "../../context/ChatContext";
import { getLanguageByCode } from "../../constants/languages";

export default function NewChatModal() {
  const { showNewChatModal, setShowNewChatModal, createNewConversation } = useChat();
  const [search, setSearch] = useState("");

  if (!showNewChatModal) return null;

  const filteredUsers = MOCK_USERS.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={() => setShowNewChatModal(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "var(--primary-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-light)",
              }}
            >
              <UserPlus size={18} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>
              New Conversation
            </h3>
          </div>

          <button
            className="action-icon-btn"
            onClick={() => setShowNewChatModal(false)}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="search-input-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search contact by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div
            style={{
              maxHeight: 320,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const lang = getLanguageByCode(user.preferredLanguage);
                return (
                  <div
                    key={user.id}
                    onClick={() => createNewConversation(user)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-sidebar-hover)";
                      e.currentTarget.style.borderColor = "var(--border-medium)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar
                        src={user.avatar}
                        name={user.username}
                        size={40}
                        online={user.online}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                          {user.username}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="lang-tag-pill">
                        {lang.flag} {lang.name}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
                No matching contacts found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
