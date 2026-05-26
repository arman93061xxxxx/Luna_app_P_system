import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { View } from 'react-native';

const PulseRing = ({ size = 100, color = 'rgba(220,20,60,0.4)', delay = 0 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: color,
    position: 'absolute',
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
};

export const PulseRings = ({ size = 80, color = 'rgba(220,20,60,0.5)' }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <PulseRing size={size} color={color} delay={0} />
    <PulseRing size={size} color={color} delay={600} />
    <PulseRing size={size} color={color} delay={1200} />
  </View>
);

export default PulseRing;
