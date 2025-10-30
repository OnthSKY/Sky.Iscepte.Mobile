export type UserPackage = 'free' | 'premium' | 'gold';

export const PACKAGE_LABELS: Record<UserPackage, string> = {
  free: 'Free',
  premium: 'Premium',
  gold: 'Gold',
};

// Default can be overridden by user profile/settings later
export const DEFAULT_USER_PACKAGE: UserPackage = 'premium';


