import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = {
      messageNew: new Set(),
      messageTranslation: new Set(),
      connect: new Set(),
      disconnect: new Set(),
      error: new Set(),
      reconnect: new Set(),
    };
  }

  connect(token) {
    // If a socket already exists, just update the auth token and ensure it
    // is active. Never create a second instance for the same session.
    if (this.socket) {
      this.socket.auth = { token };

      // socket.active means Socket.IO's reconnection loop is running.
      // Only call connect() if it has fully stopped (manual disconnect or
      // reconnectionAttempts exhausted, which we set to Infinity so this
      // should only happen after an explicit socketService.disconnect()).
      if (!this.socket.connected && !this.socket.active) {
        console.log("[Socket] Restarting stopped socket...");
        this.socket.connect();
      }

      return this.socket;
    }

    console.log("[Socket] Creating new socket instance");
    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // ── Low-level socket listeners ──────────────────────────────────────
    // These are registered ONCE per socket instance and fan out to the
    // handler Sets that callers register/unregister dynamically.

    this.socket.on("connect", () => {
      console.log("[Socket] CONNECTED:", this.socket.id);
      this.handlers.connect.forEach((cb) => cb());
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] DISCONNECTED:", reason);
      this.handlers.disconnect.forEach((cb) => cb(reason));
    });

    this.socket.on("connect_error", (err) => {
      console.error("[Socket] CONNECTION ERROR:", err.message);
      this.handlers.error.forEach((cb) => cb(err));
    });

    // "reconnect" fires after a successful auto-reconnect. We propagate it
    // so callers can re-join rooms without having to handle "connect" (which
    // also fires on the very first connection).
    this.socket.io.on("reconnect", (attemptNumber) => {
      console.log("[Socket] RECONNECTED after", attemptNumber, "attempt(s)");
      this.handlers.reconnect.forEach((cb) => cb(attemptNumber));
    });

    this.socket.on("message:new", (message) => {
      // ── DIAGNOSTIC LOG ────────────────────────────────────────────────
      console.log("[socket.js] message:new RAW", {
        id: message._id || message.id,
        senderId: message.senderId,
        conversationId: message.conversationId,
        text: message.originalText,
        handlerCount: this.handlers.messageNew.size,
      });
      // ──────────────────────────────────────────────────────────────────
      this.handlers.messageNew.forEach((cb) => cb(message));
    });

    this.socket.on("message:translation", (translation) => {
      this.handlers.messageTranslation.forEach((cb) => cb(translation));
    });

    return this.socket;
  }

  // Fully tear down the socket. Only called on user logout.
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return resolve({ ok: false, error: "Socket not connected" });
      }

      this.socket.emit("conversation:join", conversationId, (response) => {
        if (response?.ok) {
          resolve(response);
        } else {
          reject(new Error(response?.error || "Failed to join conversation"));
        }
      });
    });
  }

  sendMessage({ conversationId, originalText, sourceLanguage }) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return resolve({ ok: false, error: "Socket not connected" });
      }

      this.socket.emit(
        "message:send",
        { conversationId, originalText, sourceLanguage },
        (response) => {
          if (response?.ok) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Failed to send message"));
          }
        },
      );
    });
  }

  onMessageNew(callback) {
    this.handlers.messageNew.add(callback);
    return () => this.handlers.messageNew.delete(callback);
  }

  onMessageTranslation(callback) {
    this.handlers.messageTranslation.add(callback);
    return () => this.handlers.messageTranslation.delete(callback);
  }

  onConnect(callback) {
    this.handlers.connect.add(callback);
    return () => this.handlers.connect.delete(callback);
  }

  onDisconnect(callback) {
    this.handlers.disconnect.add(callback);
    return () => this.handlers.disconnect.delete(callback);
  }

  onReconnect(callback) {
    this.handlers.reconnect.add(callback);
    return () => this.handlers.reconnect.delete(callback);
  }

  onError(callback) {
    this.handlers.error.add(callback);
    return () => this.handlers.error.delete(callback);
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new SocketService();
export default socketService;
