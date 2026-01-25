/**
 * Authentication utility with session management
 * Handles login, logout, session expiration (30 minutes)
 */

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface AuthData {
  token: string;
  customer: any;
  expiresAt: number; // Timestamp when session expires
}

/**
 * Check if user is authenticated (valid token + not expired)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for auth data
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        const hasToken = !!auth.token;
        const hasUser = !!(auth.customer || auth.user);
        
        if (hasToken && hasUser) {
          // Check expiration if available
          const expiresAt = localStorage.getItem('auth_expires');
          if (expiresAt) {
            const expires = parseInt(expiresAt, 10);
            if (Date.now() < expires) {
              return true;
            } else {
              // Expired - clear it
              clearAuth();
              return false;
            }
          }
          // No expiration - valid
          return true;
        }
      } catch (parseError) {
        // Invalid auth data - clear it
        localStorage.removeItem('auth');
      }
    }
    
    // No valid auth found
    return false;
  } catch (error) {
    // Auth check failed - return false
    return false;
  }
}

/**
 * Get current user info if authenticated
 */
export function getCurrentUser(): any | null {
  if (!isAuthenticated()) return null;
  
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const auth = JSON.parse(authData);
      return auth.customer || auth.user || null;
    }
    
    return null;
  } catch (error) {
    // Failed to get user - return null
    return null;
  }
}

/**
 * Save authentication data with 30-minute expiration
 */
export function saveAuth(token: string, customer: any): void {
  if (typeof window === 'undefined') return;
  
  const expiresAt = Date.now() + SESSION_DURATION;
  
  const authData: AuthData = {
    token,
    customer,
    expiresAt,
  };
  
  // Store auth data
  localStorage.setItem('auth', JSON.stringify({
    user: customer,
    customer: customer,
    token: token,
    expiresAt: expiresAt,
  }));
  
  // Set expiration timestamp
  localStorage.setItem('auth_expires', expiresAt.toString());
  
  // Dispatch custom event to notify components of auth change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth');
  localStorage.removeItem('auth_expires');
  localStorage.removeItem('cart_id');
  
  // Dispatch custom event to notify components of auth change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

/**
 * Refresh auth expiration (extend session by another 30 minutes)
 */
export function refreshAuth(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const auth = JSON.parse(authData);
      if (auth.token && (auth.customer || auth.user)) {
        // Extend expiration
        const expiresAt = Date.now() + SESSION_DURATION;
        auth.expiresAt = expiresAt;
        localStorage.setItem('auth', JSON.stringify(auth));
        localStorage.setItem('auth_expires', expiresAt.toString());
      }
    }
  } catch (error) {
    // Refresh auth failed - silently ignore
  }
}

/**
 * Get time remaining until session expires (in seconds)
 */
export function getSessionTimeRemaining(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const auth = JSON.parse(authData);
      if (auth.expiresAt) {
        const remaining = auth.expiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
      }
    }
    // Fallback to auth_expires
    const expiresAt = localStorage.getItem('auth_expires');
    if (expiresAt) {
      const remaining = parseInt(expiresAt, 10) - Date.now();
      return Math.max(0, Math.floor(remaining / 1000));
    }
    return 0;
  } catch (error) {
    return 0;
  }
}
