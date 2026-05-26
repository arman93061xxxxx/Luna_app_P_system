import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2 },
  h4: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '400', letterSpacing: 0.3 },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '500', letterSpacing: 0.8, textTransform: 'uppercase' },
};
