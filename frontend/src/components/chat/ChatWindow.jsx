import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import EmptyChatState from "./EmptyChatState";
import { useChat } from "../../context/ChatContext";
import { Lock } from "lucide-react";

export default function ChatWindow({ onBackMobile, isMobileChatOpen }) {
  const { activeConversation, activeMessages, isTyping } = useChat();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  if (!activeConversation) {
    return (
      <main className={`main-chat-window ${!isMobileChatOpen ? "hidden-mobile" : ""}`}>
        <EmptyChatState />
      </main>
    );
  }

  const { participant } = activeConversation;

  return (
    <main className={`main-chat-window ${!isMobileChatOpen ? "hidden-mobile" : ""}`}>
      {/* Top Header */}
      <ChatHeader onBack={onBackMobile} />

      {/* Messages Stream */}
      <div className="messages-container">
        {/* Date / Security Notice */}
        <div className="date-separator">
          <span className="date-pill">Today</span>
        </div>

        <div className="encryption-banner">
          <Lock size={13} color="var(--primary-light)" />
          <span>
            Polyglot instant translation active. Original messages in {participant.username}'s language are preserved.
          </span>
        </div>

        {/* Message Bubbles */}
        {activeMessages.map((msg) => (
          <MessageBubble
            key={msg._id || msg.id}
            message={msg}
            partner={participant}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="typing-bubble-row">
            <div className="typing-dots">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span>{participant.username} is typing in their native language...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Dock */}
      <MessageComposer />
    </main>
  );
}
