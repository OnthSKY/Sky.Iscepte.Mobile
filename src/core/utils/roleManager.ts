import { Role } from '../config/appConstants';
import users from '../../mocks/users.json';

/**
 * Centralized role and permission management utilities
 */

/**
 * Maps role name to default user ID for permissions loading
 */
const ROLE_TO_USER_ID_MAP: Record<Role, number> = {
  admin: 1,
  owner: 2, // Premium owner
  staff: 3,
  guest: 0, // No user ID for guest
};

/**
 * Gets the default user ID for a given role
 */
export const getUserIdByRole = (role: Role): number | null => {
  const userId = ROLE_TO_USER_ID_MAP[role];
  return userId || null;
};

/**
 * Finds a user by role, preferring the first match
 * This can be extended to support multiple users per role
 */
export const getUserByRole = (role: Role): typeof users[0] | null => {
  const user = users.find((u: any) => u.role === role);
  return user || null;
};

/**
 * Validates if a username is allowed for login
 */
export const isAllowedUsername = (username: string): boolean => {
  // Find user in users.json by username
  const user = users.find((u: any) => 
    u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  return !!user;
};

/**
 * Maps username to role
 */
export const getRoleByUsername = (username: string): Role | null => {
  // Find user in users.json by username
  const user = users.find((u: any) => 
    u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  
  if (!user || !user.role) {
    return null;
  }
  
  return user.role as Role;
};

/**
 * Gets user ID by username
 */
export const getUserIdByUsername = (username: string): number | null => {
  const user = users.find((u: any) => 
    u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  return user ? user.id : null;
};

