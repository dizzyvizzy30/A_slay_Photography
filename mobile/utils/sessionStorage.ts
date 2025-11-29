import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Session,
  SessionMetadata,
  MAX_SESSIONS,
  MAX_PROMPTS_PER_WINDOW,
  RATE_LIMIT_WINDOW_MS,
} from '../types/session';

const SESSIONS_KEY = '@photography_coach_sessions';
const CURRENT_SESSION_KEY = '@photography_coach_current_session';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate session title from first message
export const generateSessionTitle = (firstMessage: string, images?: string[]): string => {
  const imageCount = images?.length || 0;
  const preview = firstMessage.substring(0, 30);
  const imageText = imageCount > 0 ? `📷 ${imageCount} ${imageCount === 1 ? 'image' : 'images'}` : '';

  if (preview.trim()) {
    return imageText ? `${imageText} - ${preview}...` : `${preview}...`;
  }

  return imageText || 'New Session';
};

// Get all sessions metadata (lightweight)
export const getAllSessionsMetadata = async (): Promise<SessionMetadata[]> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) return [];

    const sessions: Session[] = JSON.parse(sessionsJson);

    // Convert to metadata (lighter weight)
    return sessions
      .map(s => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        lastActivityAt: s.lastActivityAt,
        messageCount: s.messages.length,
        promptCount: s.promptCount,
      }))
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt); // Most recent first
  } catch (error) {
    console.error('Error loading sessions metadata:', error);
    return [];
  }
};

// Get full session by ID
export const getSession = async (sessionId: string): Promise<Session | null> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) return null;

    const sessions: Session[] = JSON.parse(sessionsJson);
    return sessions.find(s => s.id === sessionId) || null;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};

// Save/update a session
export const saveSession = async (session: Session): Promise<void> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    let sessions: Session[] = sessionsJson ? JSON.parse(sessionsJson) : [];

    // Find and update, or add new
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);

      // Enforce max sessions limit - remove oldest
      if (sessions.length > MAX_SESSIONS) {
        sessions.sort((a, b) => a.lastActivityAt - b.lastActivityAt); // Oldest first
        sessions = sessions.slice(sessions.length - MAX_SESSIONS); // Keep last MAX_SESSIONS
      }
    }

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

// Delete a session
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) return;

    let sessions: Session[] = JSON.parse(sessionsJson);
    sessions = sessions.filter(s => s.id !== sessionId);

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    // If deleted session was current, clear current
    const currentId = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
    if (currentId === sessionId) {
      await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Get current session ID
export const getCurrentSessionId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error getting current session ID:', error);
    return null;
  }
};

// Set current session ID
export const setCurrentSessionId = async (sessionId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  } catch (error) {
    console.error('Error setting current session ID:', error);
    throw error;
  }
};

// Create a new session
export const createNewSession = async (title?: string): Promise<Session> => {
  const now = Date.now();
  const newSession: Session = {
    id: generateId(),
    title: title || 'New Session',
    createdAt: now,
    lastActivityAt: now,
    messages: [],
    promptCount: 0,
  };

  await saveSession(newSession);
  await setCurrentSessionId(newSession.id);

  return newSession;
};

// Check if session has hit rate limit
export const checkRateLimit = (session: Session): { allowed: boolean; remaining: number; resetTime?: number } => {
  const now = Date.now();

  // If no prompts yet, allow
  if (session.promptCount === 0 || !session.firstPromptInWindow) {
    return { allowed: true, remaining: MAX_PROMPTS_PER_WINDOW };
  }

  const windowStart = session.firstPromptInWindow;
  const windowEnd = windowStart + RATE_LIMIT_WINDOW_MS;

  // If we're past the 5-hour window, reset
  if (now >= windowEnd) {
    return { allowed: true, remaining: MAX_PROMPTS_PER_WINDOW };
  }

  // Check if we've hit the limit within the window
  const remaining = MAX_PROMPTS_PER_WINDOW - session.promptCount;
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, resetTime: windowEnd };
  }

  return { allowed: true, remaining };
};

// Clear all sessions (for debugging)
export const clearAllSessions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing sessions:', error);
    throw error;
  }
};
