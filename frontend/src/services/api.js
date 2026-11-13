const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getHeaders(token) {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async register({ username, email, password, preferredLanguage = "en" }) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password, preferredLanguage }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.errors?.map((e) => e.message).join(", ") || data?.message || "Registration failed";
      throw new Error(errorMsg);
    }
    return data;
  }

  async login({ email, password }) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.errors?.map((e) => e.message).join(", ") || data?.message || "Login failed";
      throw new Error(errorMsg);
    }
    return data;
  }

  async getMe(token) {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: "GET",
      headers: this.getHeaders(token),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch user profile");
    }
    return data;
  }
  
async getConversations(token) {
  const response = await fetch(`${this.baseUrl}/api/conversations`, {
    method: "GET",
    headers: this.getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch conversations");
  }

  return data;
}
  async createConversation(token, participantId) {
    const response = await fetch(`${this.baseUrl}/api/conversations`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ participantId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to create conversation");
    }
    return data;
  }

  async getMessages(token, conversationId) {
    const response = await fetch(`${this.baseUrl}/api/messages/${conversationId}`, {
      method: "GET",
      headers: this.getHeaders(token),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch messages");
    }
    return data;
  }

  async sendMessage(token, conversationId, { originalText, sourceLanguage }) {
    const response = await fetch(`${this.baseUrl}/api/messages/${conversationId}`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ originalText, sourceLanguage }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to send message");
    }
    return data;
  }
}

export const api = new ApiService();
export default api;
