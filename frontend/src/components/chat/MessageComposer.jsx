import { useState, useRef } from "react";
import { Send, Paperclip, Smile, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "../../constants/languages";

export default function MessageComposer() {
  const { sendMessage, isSending, composerLanguage, setComposerLanguage } = useChat();
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const currentLang = getLanguageByCode(composerLanguage);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isSending) return;

    sendMessage({
      text: text.trim(),
      sourceLanguage: composerLanguage,
    });

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="composer-dock">
      <form onSubmit={handleSubmit}>
        <div className="composer-input-row">
          <div className="composer-actions-left">
            <button
              type="button"
              className="action-icon-btn"
              title="Attach media or document"
              onClick={() => alert("Upload media: Supports PNG, JPG, PDF up to 10MB")}
            >
              <Paperclip size={18} />
            </button>

            <button
              type="button"
              className="action-icon-btn"
              title="Insert photo"
              onClick={() => alert("Image attachment dialog")}
            >
              <ImageIcon size={18} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            className="composer-text-area"
            placeholder={`Type a message in ${currentLang.name} (${currentLang.nativeName})...`}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />

          <div className="composer-actions-right">
            {/* Quick composer language switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 8px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 6 }}>
                Sending in:
              </span>
              <select
                value={composerLanguage}
                onChange={(e) => setComposerLanguage(e.target.value)}
                title="Select the language you are writing in"
                style={{
                  background: "transparent",
                  color: "var(--primary-light)",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} style={{ background: "#171624", color: "#f3f4f6" }}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Emoji Picker Toggle */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="action-icon-btn"
                title="Emoji palette"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} />
              </button>

              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 46,
                    right: 0,
                    background: "var(--bg-sidebar)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    padding: 8,
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 6,
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                  }}
                >
                  {["👍", "❤️", "😊", "🔥", "🎉", "🙏", "✨", "👏", "🚀", "💡", "💯", "👋"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleInsertEmoji(em)}
                      style={{ fontSize: 18, padding: 4 }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send button with loading state */}
            <button
              type="submit"
              className="composer-send-btn"
              disabled={!text.trim() || isSending}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="composer-toolbar">
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={11} color="var(--primary-light)" />
          Original wording preserved • Auto-translated to recipient's preferred language
        </span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Press Enter ↵ to send • Shift+Enter for newline
        </span>
      </div>
    </div>
  );
}
