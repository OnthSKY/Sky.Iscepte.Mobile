/**
 * Responsive Breakpoints
 * 
 * Common breakpoints used across the application for consistent responsive behavior
 * Mobile-first approach: base styles for mobile, breakpoints for larger screens
 */

export const breakpoints = {
  // Small mobile phones (< 360px): Keep single column
  mobileSmall: 360,
  
  // Regular mobile phones (360-600px): Single column
  mobile: 600,
  
  // Large mobile phones / Small tablets (600-900px): 2 columns for stat cards
  tabletSmall: 900,
  
  // Regular tablets (900-1280px): 3 columns for stat cards
  tablet: 1280,
  
  // Desktop / Large tablets (1280px+): 4 columns for stat cards
  desktop: 1280,
} as const;

/**
 * Helper function to get number of columns based on width
 */
export function getColumnsForStats(width: number): 1 | 2 | 3 | 4 {
  if (width > breakpoints.tablet) return 4;
  if (width > breakpoints.tabletSmall) return 3;
  if (width > breakpoints.mobile) return 2;
  return 1;
}

/**
 * Helper function to get number of columns for menu grid
 */
export function getColumnsForMenu(width: number): 1 | 2 | 3 | 4 {
  if (width > 1200) return 4;
  if (width > breakpoints.tabletSmall) return 3;
  if (width > breakpoints.mobile) return 2;
  return 1;
}

/**
 * Helper function to check if screen is small
 */
export function isSmallScreen(width: number): boolean {
  return width < breakpoints.mobile;
}

/**
 * Helper function to check if screen is tablet or larger
 */
export function isTabletOrLarger(width: number): boolean {
  return width >= breakpoints.mobile;
}

export default breakpoints;

