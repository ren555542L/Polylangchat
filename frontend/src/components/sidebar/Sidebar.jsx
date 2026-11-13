import { Search, Plus, Filter, MessageSquareDashed } from "lucide-react";
import ConversationItem from "./ConversationItem";
import OnlineUsersBar from "./OnlineUsersBar";
import { useChat } from "../../context/ChatContext";

export default function Sidebar({ isMobileChatOpen }) {
  const {
    conversations,
    allConversations,
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    filterTab,
    setFilterTab,
    setShowNewChatModal,
  } = useChat();

  const totalUnread = allConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <aside className={`conversations-sidebar ${isMobileChatOpen ? "hidden-mobile" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-area">
          <h2 className="sidebar-title">Chats</h2>
          {totalUnread > 0 && (
            <span className="sidebar-badge">{totalUnread} new</span>
          )}
        </div>

        <div className="header-action-btns">
          <button
            className="action-icon-btn"
            title="Start new conversation"
            aria-label="New chat"
            onClick={() => setShowNewChatModal(true)}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-wrapper">
        <div className="search-input-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search or start new chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ color: "var(--text-muted)", fontSize: 13 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Online Users Row */}
      <OnlineUsersBar />

      {/* Filter Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-pill ${filterTab === "all" ? "active" : ""}`}
          onClick={() => setFilterTab("all")}
        >
          All
        </button>
        <button
          className={`filter-pill ${filterTab === "unread" ? "active" : ""}`}
          onClick={() => setFilterTab("unread")}
        >
          Unread {totalUnread > 0 ? `(${totalUnread})` : ""}
        </button>
        <button
          className={`filter-pill ${filterTab === "pinned" ? "active" : ""}`}
          onClick={() => setFilterTab("pinned")}
        >
          Pinned
        </button>
      </div>

      {/* Conversations Scrollable List */}
      <div className="conversations-scroll">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => setActiveConversationId(conv.id)}
            />
          ))
        ) : (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <MessageSquareDashed size={32} opacity={0.5} />
            <p style={{ fontSize: 13 }}>No conversations found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  fontSize: 12,
                  color: "var(--accent-cyan)",
                  textDecoration: "underline",
                }}
              >
                Clear search query
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
