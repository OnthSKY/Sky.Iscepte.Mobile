/**
 * JWT Utility Functions
 * Parse JWT token and extract payload information
 */

export interface JWTPayload {
  sub?: string | number;
  userId?: number;
  username?: string;
  role?: string;
  permissions?: string[]; // Format: ["module:action", "sales:create", "stock:custom_form", ...]
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string | null | undefined): JWTPayload | null {
  if (!token) return null;
  
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Not a standard JWT, might be mock token - return null to use fallback
      return null;
    }
    
    // Decode payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    // Replace URL-safe base64 characters and add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    // Decode
    const decoded = atob(padded);
    
    // Parse JSON
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extract permissions from JWT token
 * @param token - JWT token string
 * @returns Array of permission strings (format: "module:action") or empty array
 */
export function extractPermissionsFromToken(token: string | null | undefined): string[] {
  const payload = decodeJWT(token);
  if (!payload || !payload.permissions) {
    return [];
  }
  
  // Ensure permissions is an array
  if (Array.isArray(payload.permissions)) {
    return payload.permissions;
  }
  
  return [];
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID or null
 */
export function extractUserIdFromToken(token: string | null | undefined): number | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // Try different fields
  if (payload.userId && typeof payload.userId === 'number') {
    return payload.userId;
  }
  
  if (payload.sub) {
    const subId = typeof payload.sub === 'number' ? payload.sub : parseInt(String(payload.sub), 10);
    if (!isNaN(subId)) {
      return subId;
    }
  }
  
  return null;
}

/**
 * Extract role from JWT token
 * @param token - JWT token string
 * @returns Role string or null
 */
export function extractRoleFromToken(token: string | null | undefined): string | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.role) {
    return null;
  }
  
  return String(payload.role);
}

