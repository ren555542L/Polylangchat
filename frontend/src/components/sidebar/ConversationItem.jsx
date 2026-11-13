import Avatar from "../common/Avatar";
import { getLanguageByCode } from "../../constants/languages";

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
}) {
  const { participant, lastMessage, unreadCount } = conversation;
  const lang = getLanguageByCode(lastMessage?.sourceLanguage || participant?.preferredLanguage);

  return (
    <div
      className={`conversation-card ${isActive ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="card-avatar-wrap">
        <Avatar
          src={participant.avatar}
          name={participant.username}
          size={46}
          online={participant.online}
        />
      </div>

      <div className="card-content">
        <div className="card-top-row">
          <span className="card-name">{participant.username}</span>
          <span className="card-time">{lastMessage?.timestamp || "Recent"}</span>
        </div>

        <div className="card-bottom-row">
          <span className="card-last-msg">
            {lastMessage?.isSelf ? "You: " : ""}
            {lastMessage?.translatedText || lastMessage?.text || "Started conversation"}
          </span>

          <div className="card-badges">
            <span className="lang-tag-pill" title={`Original language: ${lang.name}`}>
              {lang.flag} {lang.code.toUpperCase()}
            </span>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
