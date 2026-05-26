import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CrimsonButton = ({ title, onPress, loading, style, variant = 'primary', disabled }) => {
  const scale = useSharedValue(1);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    if (!disabled && !loading) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        false
      );
    }
  }, [disabled, loading]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.7]),
    shadowRadius: interpolate(glowPulse.value, [0, 1], [8, 20]),
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 20 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 20 }); };

  if (variant === 'outline') {
    return (
      <AnimatedTouchable
        style={[styles.outline, animStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.crimson} />
        ) : (
          <Text style={[typography.button, styles.outlineText]}>{title}</Text>
        )}
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[animStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.glowWrap, glowStyle]}>
        <LinearGradient
          colors={disabled ? ['#3a0010', '#1a0008'] : ['#FF2D55', '#DC143C', '#8B0000']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[typography.button, styles.text]}>{title}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  glowWrap: {
    borderRadius: 14,
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(220,20,60,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,20,60,0.06)',
  },
  text: { color: '#fff', letterSpacing: 0.5 },
  outlineText: { color: colors.crimson },
});

export default CrimsonButton;
