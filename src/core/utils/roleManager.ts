import { Role } from '../config/permissions';
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
  return ['admin', 'owner', 'staff'].includes(username);
};

/**
 * Maps username to role
 */
export const getRoleByUsername = (username: string): Role | null => {
  if (!isAllowedUsername(username)) {
    return null;
  }
  return username as Role;
};

