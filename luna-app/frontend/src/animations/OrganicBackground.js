/**
 * OrganicBackground — subtle ambient biological effect
 * Pure RN implementation, no Skia dependency
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

const GlowOrb = ({ left, top, size, delay = 0 }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 5000, easing: Easing.inOut(Easing.sine) }),
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sine) })
        ),
        -1, false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: left - (size * scale.value) / 2,
    top: top - (size * scale.value) / 2,
    width: size * scale.value,
    height: size * scale.value,
    borderRadius: (size * scale.value) / 2,
    backgroundColor: 'rgba(139,0,0,0.06)',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(scale.value, [1, 1.3], [0.03, 0.08]),
    shadowRadius: size * 0.3,
  }));

  return <Animated.View style={style} />;
};

const VeinLine = ({ style: lineStyle, delay = 0 }) => {
  const opacity = useSharedValue(0.02);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.07, { duration: 6000, easing: Easing.inOut(Easing.sine) }),
          withTiming(0.02, { duration: 6000, easing: Easing.inOut(Easing.sine) })
        ),
        -1, false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.vein, lineStyle, animStyle]} />;
};

const OrganicBackground = () => (
  <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
    <GlowOrb left={W * 0.15} top={H * 0.2} size={W * 0.5} delay={0} />
    <GlowOrb left={W * 0.85} top={H * 0.7} size={W * 0.4} delay={2500} />
    <GlowOrb left={W * 0.5}  top={H * 0.5} size={W * 0.6} delay={1200} />
    <VeinLine style={{ left: W * 0.05, width: 1, height: H }} delay={0} />
    <VeinLine style={{ left: W * 0.95, width: 1, height: H }} delay={1200} />
    <VeinLine style={{ left: W * 0.5,  width: 1, height: H }} delay={600} />
    <VeinLine style={{ top: H * 0.3, width: W, height: 1 }} delay={2000} />
    <VeinLine style={{ top: H * 0.7, width: W, height: 1 }} delay={2800} />
  </View>
);

const styles = StyleSheet.create({
  vein: {
    position: 'absolute',
    backgroundColor: '#8B0000',
  },
});

export default OrganicBackground;
