/**
 * Enhanced Color System & Theme for EduTechAssistance Mobile App
 * Meets WCAG AA contrast standards.
 */

export const Colors = {
  primary: '#1E40AF',       // Blue 800 - High contrast primary
  primaryDark: '#1E3A8A',   // Blue 900
  secondary: '#6D28D9',     // Violet 700 - Deep contrast accent
  success: '#047857',       // Emerald 700 - Deep green
  warning: '#C2410C',       // Orange 700 - High visibility
  error: '#B91C1C',         // Red 700
  info: '#0E7490',          // Cyan 700

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Backgrounds & Surface
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Border & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Tint colors for Expo Router tab bars
  tint: '#1E40AF',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#1E40AF',
};

export const ColorCombinations = {
  buttons: {
    primary: { bg: '#1E40AF', text: '#FFFFFF', hover: '#1E3A8A' },
    success: { bg: '#047857', text: '#FFFFFF', hover: '#065F46' },
    warning: { bg: '#C2410C', text: '#FFFFFF', hover: '#9A3412' },
    error: { bg: '#B91C1C', text: '#FFFFFF', hover: '#991B1B' },
  },
  textOnBackground: {
    light: { bg: '#FFFFFF', text: '#1E293B', secondary: '#475569' },
    surface: { bg: '#F8FAFC', text: '#1E293B', secondary: '#64748B' },
  }
};

