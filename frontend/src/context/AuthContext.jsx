import { createContext, useContext, useState, useEffect } from "react";
import { MOCK_CURRENT_USER } from "../data/mockData";
import { api } from "../services/api";
import { socketService } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("polyglot_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("polyglot_token") || null,
  );

  const [isMockMode, setIsMockMode] = useState(
    () => localStorage.getItem("polyglot_mock_mode") !== "false",
  );

  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("polyglot_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("polyglot_user");
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("polyglot_token", token);
    } else {
      localStorage.removeItem("polyglot_token");
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem("polyglot_mock_mode", String(isMockMode));
  }, [isMockMode]);

  const login = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      // Always attempt the real API when credentials are provided, regardless
      // of isMockMode. The mock path is intentionally skipped here — demo
      // personas use switchMockUser() directly. This prevents the mock
      // simulation from firing when real accounts log in on a browser that
      // still has isMockMode=true in localStorage from a previous session.
      const res = await api.login({ email, password });
      setCurrentUser(res.user);
      setToken(res.token);
      // Explicitly disable mock mode so sendMessage() uses the real socket
      // path. Without this, pre-existing test accounts (admin, aryan) would
      // enter mock mode by default because localStorage never received "false".
      setIsMockMode(false);
      return { ok: true, user: res.user };
    } catch (err) {
      setAuthError(err.message || "Failed to log in");
      return { ok: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async ({ username, email, password, preferredLanguage }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isMockMode) {
        const mockUser = {
          id: "user_" + Math.random().toString(36).substring(2, 9),
          username,
          email,
          preferredLanguage: preferredLanguage || "en",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          status: "Online",
        };
        setCurrentUser(mockUser);
        setToken("mock_jwt_" + Date.now());
        return { ok: true, user: mockUser };
      }

      const res = await api.register({
        username,
        email,
        password,
        preferredLanguage,
      });

      const loginRes = await api.login({ email, password });

      setCurrentUser(loginRes.user);
      setToken(loginRes.token);
      setIsMockMode(false);

      return { ok: true, user: loginRes.user };
    } catch (err) {
      setAuthError(err.message || "Failed to register");
      return { ok: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    // Fully tear down the socket before clearing credentials so that the
    // auto-reconnect loop does not keep running with a stale token.
    socketService.disconnect();
    setCurrentUser(null);
    setToken(null);
  };

  const updatePreferredLanguage = (languageCode) => {
    if (!currentUser) return;
    setCurrentUser((prev) => ({
      ...prev,
      preferredLanguage: languageCode,
    }));
  };

  const switchMockUser = (user) => {
    setCurrentUser(user);
    setToken("mock_jwt_" + user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: Boolean(currentUser),
        isMockMode,
        setIsMockMode,
        authError,
        authLoading,
        login,
        register,
        logout,
        updatePreferredLanguage,
        switchMockUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
