export const colors = {
  // Core palette - Brighter and more vibrant
  black: '#1A0A0F',
  darkBg: '#2D1319',
  deepBlack: '#0F0508',

  // Crimson / Blood reds - More vibrant and cartoonic
  crimson: '#FF1744',
  bloodRed: '#E91E63',
  deepMaroon: '#C2185B',
  darkMaroon: '#880E4F',
  lightCrimson: '#FF4081',
  roseRed: '#F06292',

  // Gradients (used as arrays) - More colorful
  bgGradient: ['#1A0A0F', '#2D1319', '#3D1A23'],
  cardGradient: ['rgba(255, 23, 68, 0.12)', 'rgba(233, 30, 99, 0.08)'],
  buttonGradient: ['#FF1744', '#E91E63'],
  splashGradient: ['#1A0A0F', '#2D1319', '#3D1A23', '#4D2229'],

  // Glass - More visible
  glass: 'rgba(255, 23, 68, 0.08)',
  glassBorder: 'rgba(255, 64, 129, 0.35)',
  glassDark: 'rgba(26, 10, 15, 0.7)',

  // Text - Brighter
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.85)',
  textMuted: 'rgba(255,255,255,0.5)',
  textAccent: '#FF4081',

  // Status - More vibrant
  success: '#69F0AE',
  warning: '#FFC107',
  danger: '#FF5252',
  info: '#40C4FF',

  // Cycle phases - Brighter colors
  menstrual: '#FF1744',
  follicular: '#FFB3D9',
  ovulation: '#FF6B9D',
  luteal: '#F06292',
  fertile: '#FF8A80',
};

export const shadows = {
  glow: {
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 12,
  },
  card: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
};
