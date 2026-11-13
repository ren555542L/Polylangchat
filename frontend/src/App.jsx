import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider, useChat } from "./context/ChatContext";
import LeftNavRail from "./components/layout/LeftNavRail";
import Sidebar from "./components/sidebar/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
import ContactDrawer from "./components/chat/ContactDrawer";
import NewChatModal from "./components/modals/NewChatModal";
import AuthScreen from "./components/auth/AuthScreen";
import LandingPage from "./components/landing/LandingPage";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { activeConversationId } = useChat();

  const [currentPage, setCurrentPage] = useState("landing"); // 'landing' | 'app'
  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'register' | null
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(Boolean(activeConversationId));

  const handleOpenLogin = () => {
    setAuthModalMode("login");
  };

  const handleOpenSignup = () => {
    setAuthModalMode("register");
  };

  const handleAuthSuccess = () => {
    setAuthModalMode(null);
    setCurrentPage("app");
  };

  if (currentPage === "landing") {
    return (
      <>
        <LandingPage
          onLogin={handleOpenLogin}
          onSignup={handleOpenSignup}
          onEnterApp={() => setCurrentPage("app")}
        />

        {authModalMode && (
          <AuthScreen
            initialMode={authModalMode}
            onBackToChat={() => setAuthModalMode(null)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className="polyglot-app">
      {/* Mini Left Navigation Rail */}
      <LeftNavRail
        onOpenAuth={handleOpenLogin}
        onGoHome={() => setCurrentPage("landing")}
      />

      {/* Main Conversation Sidebar */}
      <Sidebar isMobileChatOpen={isMobileChatOpen} />

      {/* Main Chat Conversation View */}
      <ChatWindow
        isMobileChatOpen={isMobileChatOpen}
        onBackMobile={() => setIsMobileChatOpen(false)}
      />

      {/* Collapsible Contact & Settings Drawer */}
      <ContactDrawer />

      {/* New Conversation Modal */}
      <NewChatModal />

      {/* Auth Screen Modal if triggered inside app */}
      {(authModalMode || !isAuthenticated) && (
        <AuthScreen
          initialMode={authModalMode || "login"}
          onBackToChat={() => setAuthModalMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}
