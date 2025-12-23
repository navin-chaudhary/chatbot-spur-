// Dynamic API base URL - uses environment variable or falls back to production/local
// In development: uses VITE_API_URL or defaults to http://localhost:3001
// In production: uses VITE_API_URL or defaults to production URL
const getApiBase = (): string => {
  // Check for explicit environment variable (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development mode, use local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // In production, use production backend URL
  return 'https://chatbot-spur.onrender.com';
};

const API_BASE = getApiBase();

export interface ChatMessage {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  error?: boolean;
}

export interface MessageHistory {
  sessionId: string;
  messages: Array<{
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
}

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sessionId,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to send message';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch (e2) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error('Invalid response from server');
  }
}

export async function getHistory(sessionId: string): Promise<MessageHistory> {
  const response = await fetch(`${API_BASE}/chat/history/${sessionId}`);

  if (!response.ok) {
    throw new Error('Failed to load history');
  }

  return response.json();
}

