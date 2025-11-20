/**
 * Session Management for CV Tailor Agent
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * WHAT IS A SESSION?
 * A session represents one user's interaction with our app:
 * - Upload CV
 * - Get tailored version
 * - Download results
 *
 * WHY SESSIONS?
 * 1. Data Isolation: Each user's CV data is separate
 * 2. Privacy: No mixing of user data
 * 3. Cleanup: Can delete session data when done
 * 4. Tracking: Know which CV belongs to which request
 *
 * SESSION LIFECYCLE:
 * 1. User uploads CV → Create session
 * 2. CV stored in ChromaDB collection (session_xyz)
 * 3. Agent processes with session context
 * 4. Results returned to user
 * 5. Session expires after X time (optional)
 *
 * EXAMPLE:
 * User A uploads CV → session_abc123 → collection_abc123
 * User B uploads CV → session_xyz789 → collection_xyz789
 * Both can use app simultaneously without interference!
 */

import { generateSessionId } from './utils';

/**
 * Session data structure
 *
 * 📚 LEARNING: What do we store?
 * - sessionId: Unique identifier
 * - createdAt: When session started
 * - cvText: Extracted CV text
 * - collectionName: ChromaDB collection name
 * - status: Current processing status
 */
export interface Session {
  sessionId: string;
  createdAt: Date;
  cvText?: string;
  collectionName: string;
  jobDescription?: string;
  status: 'initialized' | 'processing' | 'completed' | 'error';
  result?: {
    tailoredCV?: string;
    coverLetter?: string;
    matchScore?: number;
  };
  error?: string;
}

/**
 * In-memory session storage
 *
 * 📚 LEARNING: Why in-memory?
 * - Fast access
 * - Simple for MVP
 * - Automatic cleanup when server restarts
 *
 * FOR PRODUCTION:
 * - Use Redis for persistence
 * - Add session expiration
 * - Handle server restarts gracefully
 */
const sessions = new Map<string, Session>();

/**
 * Create a new session
 *
 * @returns New session object
 */
export function createSession(): Session {
  const sessionId = generateSessionId();

  const session: Session = {
    sessionId,
    createdAt: new Date(),
    collectionName: `cv_session_${sessionId}`,
    status: 'initialized',
  };

  sessions.set(sessionId, session);

  console.log('[Session] Created:', sessionId);

  return session;
}

/**
 * Get session by ID
 *
 * @param sessionId - Session identifier
 * @returns Session object or undefined
 */
export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

/**
 * Update session data
 *
 * @param sessionId - Session identifier
 * @param updates - Partial session updates
 */
export function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Session | undefined {
  const session = sessions.get(sessionId);

  if (!session) {
    console.error('[Session] Not found:', sessionId);
    return undefined;
  }

  const updated = { ...session, ...updates };
  sessions.set(sessionId, updated);

  console.log('[Session] Updated:', sessionId, Object.keys(updates));

  return updated;
}

/**
 * Delete session and cleanup
 *
 * 📚 LEARNING: Cleanup is important!
 * - Frees memory
 * - Removes sensitive data
 * - Good practice for privacy
 *
 * @param sessionId - Session identifier
 */
export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);

  if (deleted) {
    console.log('[Session] Deleted:', sessionId);
  }

  return deleted;
}

/**
 * Get all active sessions (for debugging)
 *
 * @returns Array of session IDs
 */
export function getActiveSessions(): string[] {
  return Array.from(sessions.keys());
}

/**
 * Cleanup old sessions (optional)
 *
 * 📚 LEARNING: Memory management
 * In production, you'd run this periodically
 * to remove expired sessions
 *
 * @param maxAgeMs - Maximum session age in milliseconds
 */
export function cleanupOldSessions(maxAgeMs: number = 3600000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of sessions.entries()) {
    const age = now - session.createdAt.getTime();

    if (age > maxAgeMs) {
      sessions.delete(sessionId);
      cleaned++;
      console.log('[Session] Expired:', sessionId);
    }
  }

  if (cleaned > 0) {
    console.log(`[Session] Cleaned up ${cleaned} old sessions`);
  }

  return cleaned;
}

/**
 * 📚 LEARNING: Session Management Patterns
 * =========================================
 *
 * 1. STATELESS vs STATEFUL:
 *
 *    STATELESS (Better for scale):
 *    - Use JWT tokens
 *    - All data in token
 *    - No server-side storage
 *
 *    STATEFUL (Our approach):
 *    - Store data on server
 *    - Session ID only sent to client
 *    - More secure for sensitive data
 *
 * 2. WHERE TO STORE SESSIONS:
 *
 *    Development (our choice):
 *    - In-memory Map
 *    - Simple, fast
 *    - Lost on restart
 *
 *    Production options:
 *    - Redis (fast, distributed)
 *    - Database (persistent)
 *    - Edge KV (serverless)
 *
 * 3. SESSION SECURITY:
 *
 *    Best practices:
 *    ✅ Use random, unpredictable IDs
 *    ✅ Set expiration times
 *    ✅ Clear sensitive data after use
 *    ✅ Validate session on every request
 *    ❌ Never expose internal IDs
 *    ❌ Never store passwords in sessions
 *
 * 4. VERCEL CONSIDERATIONS:
 *
 *    Vercel is serverless = each request can be different server
 *    - In-memory sessions work within one request
 *    - For cross-request persistence, use:
 *      * Vercel KV (Redis)
 *      * Database
 *      * Edge Config
 *
 *    Our approach works because:
 *    - Session used within single request
 *    - CV processed and returned immediately
 *    - No need for cross-request persistence
 */
