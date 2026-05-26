import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Base design was done at 390px wide (iPhone 14)
const BASE_W = 390;
const BASE_H = 844;

// Scale factor
export const scale = (size) => Math.round((W / BASE_W) * size);
export const vscale = (size) => Math.round((H / BASE_H) * size);

// Moderate scale — less aggressive, good for fonts
export const ms = (size, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);

// Responsive font size
export const rf = (size) => {
  const newSize = ms(size);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Screen dimensions
export const SW = W;   // screen width
export const SH = H;   // screen height

// Is tablet (width > 600)
export const isTablet = W >= 600;

// Is large phone (width > 400)
export const isLarge = W >= 400;

// Responsive padding
export const rp = (size) => scale(size);

// Max content width for large screens
export const MAX_W = Math.min(W, 600);
