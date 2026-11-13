import { useState } from "react";
import { Check, CheckCheck, Eye, EyeOff, Copy, Check as CopiedIcon, Globe2, Sparkles } from "lucide-react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { getLanguageByCode } from "../../constants/languages";

export default function MessageBubble({ message, partner }) {
  const { currentUser } = useAuth();
  const { revealedOriginals, toggleRevealOriginal } = useChat();
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);

  const isSelf = message.senderId === currentUser?.id || message.isSelf;
  const isRevealed = Boolean(revealedOriginals[message._id]);

  const sourceLang = getLanguageByCode(message.sourceLanguage || "en");
  const targetLang = getLanguageByCode(message.translation?.targetLanguage || currentUser?.preferredLanguage || "en");

  const hasTranslation = Boolean(message.translation?.translatedText);
  const displayText = hasTranslation && !isRevealed
    ? message.translation.translatedText
    : message.originalText;

  const formatTime = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddReaction = (emoji) => {
    if (reactions.includes(emoji)) {
      setReactions(reactions.filter((r) => r !== emoji));
    } else {
      setReactions([...reactions, emoji]);
    }
  };

  return (
    <div className={`message-row ${isSelf ? "sent" : "received"}`}>
      {!isSelf && (
        <Avatar
          src={partner?.avatar}
          name={partner?.username || "Contact"}
          size={36}
          showOnlineDot={false}
        />
      )}

      <div className="message-content-wrapper">
        {!isSelf && (
          <div className="message-author-tag">
            <span>{partner?.username}</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 6 }}>
              {sourceLang.flag} {sourceLang.name}
            </span>
          </div>
        )}

        <div className="message-bubble">
          {/* Main message text */}
          <div className="bubble-text-translated">
            {displayText}
          </div>

          {/* Image attachment if any */}
          {message.image && (
            <div className="bubble-image-preview">
              <img src={message.image} alt="Message media preview" loading="lazy" />
            </div>
          )}

          {/* Translation attribution & original reveal card */}
          {!isSelf && hasTranslation && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span className="translation-info-pill">
                  <Sparkles size={11} color="#a78bfa" />
                  <span>
                    {isRevealed
                      ? `Viewing original • ${sourceLang.name}`
                      : `Translated: ${sourceLang.name} ➔ ${targetLang.name}`}
                  </span>
                </span>

                <button
                  className="reveal-toggle-btn"
                  onClick={() => toggleRevealOriginal(message._id)}
                  title={isRevealed ? "Show translated text" : "Reveal the original wording sent by author"}
                >
                  {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{isRevealed ? "Show translation" : `Reveal original (${sourceLang.nativeName})`}</span>
                </button>
              </div>

              {/* Collapsible card showing original alongside translation */}
              {isRevealed && (
                <div className="original-reveal-card">
                  <div className="original-header-line">
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe2 size={12} color="var(--accent-cyan)" />
                      Original message ({sourceLang.name}):
                    </span>
                    <button
                      onClick={handleCopy}
                      title="Copy original text"
                      style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}
                    >
                      {copied ? <CopiedIcon size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="original-text-content" lang={sourceLang.code}>
                    “{message.originalText}”
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sent message source language badge */}
          {isSelf && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-end", opacity: 0.85, fontSize: 10 }}>
              <span>Sent in {sourceLang.name}</span>
            </div>
          )}

          {/* Reaction pills */}
          {reactions.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {reactions.map((r, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-full)",
                    fontSize: 12,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Meta Info: Timestamp, Read Receipts, Quick Actions */}
        <div className="message-meta-row">
          <span>{formatTime(message.createdAt)}</span>

          {isSelf && (
            <span className="read-receipt-check" title="Delivered & Read">
              <CheckCheck size={14} />
            </span>
          )}

          {/* Quick Reaction buttons on hover */}
          <div
            className="message-quick-reactions"
            style={{ display: "inline-flex", gap: 4, marginLeft: 6, opacity: 0.6 }}
          >
            <button
              onClick={() => handleAddReaction("👍")}
              style={{ fontSize: 11 }}
              title="React thumbs up"
            >
              👍
            </button>
            <button
              onClick={() => handleAddReaction("❤️")}
              style={{ fontSize: 11 }}
              title="React heart"
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
