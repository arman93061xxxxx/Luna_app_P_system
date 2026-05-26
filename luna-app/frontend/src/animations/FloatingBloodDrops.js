import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  withSequence,
} from 'react-native-reanimated';

const BloodDrop = ({ delay, startX, duration }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(800, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.sine) }),
          withTiming(-20, { duration: duration / 2, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 500 }),
          withTiming(0.8, { duration: duration - 1000 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1.2, { duration: duration - 500 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.drop, { left: startX }, animatedStyle]}>
      <View style={styles.dropInner} />
    </Animated.View>
  );
};

const FloatingBloodDrops = () => {
  const drops = [
    { delay: 0, startX: '10%', duration: 6000 },
    { delay: 1000, startX: '30%', duration: 7000 },
    { delay: 2000, startX: '50%', duration: 5500 },
    { delay: 1500, startX: '70%', duration: 6500 },
    { delay: 500, startX: '85%', duration: 6200 },
    { delay: 2500, startX: '20%', duration: 5800 },
    { delay: 3000, startX: '60%', duration: 6800 },
    { delay: 800, startX: '40%', duration: 5300 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {drops.map((drop, index) => (
        <BloodDrop key={index} {...drop} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  drop: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 28,
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 20,
    backgroundColor: '#FF1744',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  dropInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default FloatingBloodDrops;
