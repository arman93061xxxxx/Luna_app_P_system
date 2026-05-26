/**
 * MetaballFluid — cinematic blood fluid animation
 * Compatible with @shopify/react-native-skia 1.2.3
 */
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

// Single viscous droplet using pure RN animated views
export const ViscousDroplet = ({ x, startY = -20, radius = 10, delay = 0, fallDuration = 1800, color = '#DC143C' }) => {
  const progress = useSharedValue(0);
  const stretch = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: fallDuration, easing: Easing.in(Easing.poly(2.5)) }),
        -1, false
      )
    );
    stretch.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(2.4, { duration: fallDuration * 0.5, easing: Easing.out(Easing.quad) }),
          withTiming(1.2, { duration: fallDuration * 0.5, easing: Easing.in(Easing.quad) })
        ),
        -1, false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - radius,
    top: interpolate(progress.value, [0, 1], [startY, H + radius * 4]),
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: color,
    opacity: interpolate(progress.value, [0, 0.05, 0.9, 1], [0, 1, 0.85, 0]),
    transform: [{ scaleY: stretch.value }],
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: radius * 0.5,
  }));

  return <Animated.View style={style} />;
};

// Blood pool spreading from bottom
export const BloodPool = ({ startDelay = 600, onFormed }) => {
  const scaleX = useSharedValue(0);
  const scaleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(startDelay, withTiming(1, { duration: 500 }));
    scaleX.value = withDelay(startDelay, withTiming(1, { duration: 2200, easing: Easing.out(Easing.exp) }));
    scaleY.value = withDelay(startDelay, withTiming(1, { duration: 2600, easing: Easing.out(Easing.exp) }));
    if (onFormed) {
      const t = setTimeout(onFormed, startDelay + 2400);
      return () => clearTimeout(t);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.5,
    opacity: opacity.value,
    transform: [{ scaleX: scaleX.value }, { scaleY: scaleY.value }],
  }));

  return (
    <Animated.View style={style}>
      <View style={{
        flex: 1,
        backgroundColor: 'transparent',
        borderTopLeftRadius: W * 0.6,
        borderTopRightRadius: W * 0.6,
        backgroundColor: 'rgba(120,0,15,0.7)',
        shadowColor: '#DC143C',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
      }} />
    </Animated.View>
  );
};

// Pulsing vein texture overlay
export const TissueBackground = () => {
  const opacity = useSharedValue(0.03);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.08, { duration: 4000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.03, { duration: 4000, easing: Easing.inOut(Easing.sine) })
      ),
      -1, false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ position: 'absolute', width: W, height: H }, style]}>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: (W / 6) * i,
            top: 0,
            width: 1,
            height: H,
            backgroundColor: '#8B0000',
            borderRadius: 1,
          }}
        />
      ))}
    </Animated.View>
  );
};

// Ambient micro-droplets for login screen
export const AmbientDroplets = () => {
  const drops = [
    { x: W * 0.08, delay: 0,    dur: 4200, r: 3 },
    { x: W * 0.22, delay: 1400, dur: 3800, r: 2 },
    { x: W * 0.67, delay: 700,  dur: 4600, r: 4 },
    { x: W * 0.85, delay: 2100, dur: 3500, r: 2.5 },
    { x: W * 0.44, delay: 3000, dur: 5000, r: 3 },
  ];

  return (
    <>
      {drops.map((d, i) => (
        <ViscousDroplet key={i} x={d.x} startY={-20} radius={d.r} delay={d.delay} fallDuration={d.dur} color="rgba(180,0,30,0.7)" />
      ))}
    </>
  );
};

// Main drops config
const MAIN_DROPS = [
  { x: W * 0.18, r: 10, delay: 0,   dur: 1400 },
  { x: W * 0.35, r: 14, delay: 180, dur: 1600 },
  { x: W * 0.52, r: 18, delay: 60,  dur: 1300 },
  { x: W * 0.68, r: 12, delay: 320, dur: 1500 },
  { x: W * 0.82, r: 9,  delay: 140, dur: 1700 },
  { x: W * 0.28, r: 11, delay: 500, dur: 1450 },
  { x: W * 0.75, r: 8,  delay: 260, dur: 1550 },
  { x: W * 0.44, r: 15, delay: 420, dur: 1350 },
];

const MetaballFluid = ({ onPoolFormed }) => (
  <>
    <TissueBackground />
    {MAIN_DROPS.map((d, i) => (
      <ViscousDroplet
        key={i}
        x={d.x}
        startY={-d.r * 2}
        radius={d.r}
        delay={d.delay}
        fallDuration={d.dur}
        color={i % 2 === 0 ? '#DC143C' : '#8B0000'}
      />
    ))}
    <BloodPool startDelay={700} onFormed={onPoolFormed} />
  </>
);

export default MetaballFluid;
