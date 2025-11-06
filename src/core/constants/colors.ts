export const lightColors = {
  // Updated per latest spec
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  secondary: '#00A868',
  accent: '#00A868',
  info: '#2563EB',
  profit: '#8B5CF6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  page: '#F8FAFC',
  card: '#E2E7EF',
  text: '#0F172A',
  muted: '#475569', // textSecondary
  border: '#E2E8F0',
  success: '#00A868',
  error: '#DC2626',
  warning: '#F59E0B',
  gradient: ['#1D4ED8', '#3B82F6'] as const, // header gradient mapping
  
  // Stat colors (used in dashboard cards and stats)
  statPrimary: '#1D4ED8',
  statSuccess: '#059669',
  statSuccessVariant: '#059669',
  statError: '#DC2626',
  statErrorVariant: '#E11D48',
  statErrorAlt: '#DC2626',
  statWarning: '#D97706',
  statPurple: '#7C3AED',
  statMuted: '#64748B',
  
  // Overlay colors
  overlayLight: '#FFFFFF10',
  overlayDark: '#00000010',
  
  // Info card colors (for module overview info cards)
  infoCardBackground: '#EFF6FF', // Light blue background
  infoCardBorder: '#BFDBFE', // Light blue border
  infoCardText: '#1E40AF', // Dark blue text
  infoCardIcon: '#3B82F6', // Blue icon
  warningCardBackground: '#FEF3C7', // Light yellow background
  warningCardBorder: '#FDE68A', // Light yellow border
  warningCardText: '#92400E', // Dark yellow text
  warningCardIcon: '#F59E0B', // Yellow icon
  successCardBackground: '#D1FAE5', // Light green background
  successCardBorder: '#A7F3D0', // Light green border
  successCardText: '#065F46', // Dark green text
  successCardIcon: '#10B981', // Green icon
};

export const darkColors = {
  // Updated per latest spec
  primary: '#2D81FF',
  primaryDark: '#1E3A8A',
  secondary: '#00C47A',
  accent: '#00C47A',
  info: '#3D8BFF',
  profit: '#8B5CF6',
  background: '#0D1117',
  surface: '#161B22',
  page: '#0D1117',
  card: '#1E242C',
  text: '#E6EDF3',
  muted: '#8B97A7',
  border: '#2C333D',
  success: '#00B686',
  error: '#E53935',
  warning: '#FFB020',
  gradient: ['#0F172A', '#1E3A8A'] as const, // header gradient mapping
  
  // Stat colors (used in dashboard cards and stats)
  statPrimary: '#60A5FA',
  statSuccess: '#34D399',
  statSuccessVariant: '#10B981',
  statError: '#F87171',
  statErrorVariant: '#FB7185',
  statErrorAlt: '#EF4444',
  statWarning: '#F59E0B',
  statPurple: '#A78BFA',
  statMuted: '#94A3B8',
  
  // Overlay colors
  overlayLight: '#FFFFFF10',
  overlayDark: '#00000010',
  
  // Info card colors (for module overview info cards)
  infoCardBackground: '#1E3A8A20', // Dark blue background (20% opacity)
  infoCardBorder: '#3B82F650', // Blue border (50% opacity)
  infoCardText: '#93C5FD', // Light blue text
  infoCardIcon: '#60A5FA', // Light blue icon
  warningCardBackground: '#78350F30', // Dark yellow background (30% opacity)
  warningCardBorder: '#F59E0B50', // Yellow border (50% opacity)
  warningCardText: '#FCD34D', // Light yellow text
  warningCardIcon: '#FBBF24', // Light yellow icon
  successCardBackground: '#064E3B30', // Dark green background (30% opacity)
  successCardBorder: '#10B98150', // Green border (50% opacity)
  successCardText: '#6EE7B7', // Light green text
  successCardIcon: '#34D399', // Light green icon
};

const colors = lightColors;

export default colors;


