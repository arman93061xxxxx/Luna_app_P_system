import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const GlassCard = ({ children, style, gradient = false, pressable = false, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (pressable) scale.value = withSpring(0.98, { damping: 20 });
  };
  const handlePressOut = () => {
    if (pressable) scale.value = withSpring(1, { damping: 20 });
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = gradient ? (
    <LinearGradient
      colors={['rgba(180,0,20,0.18)', 'rgba(80,0,10,0.1)', 'rgba(0,0,0,0.2)']}
      style={[styles.card, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

  if (pressable) {
    return (
      <Animated.View style={animStyle} onTouchStart={handlePressIn} onTouchEnd={handlePressOut}>
        {content}
      </Animated.View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(139,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220,20,60,0.18)',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
});

export default GlassCard;
