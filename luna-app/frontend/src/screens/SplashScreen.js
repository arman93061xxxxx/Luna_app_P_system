import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import MetaballFluid from '../animations/MetaballFluid';
import { PulseRings } from '../animations/PulseRing';
import { colors } from '../theme/colors';

const { width: W, height: H } = Dimensions.get('window');

// Cinematic letter reveal for "LUNA"
const LetterReveal = ({ letter, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.back(1.8)) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.letterChar, style]}>{letter}</Animated.Text>
  );
};

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('drops'); // drops → pool → logo → exit

  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const taglineOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const bgShift = useSharedValue(0);

  // Background color shift during animation
  useEffect(() => {
    bgShift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
  }, []);

  const handlePoolFormed = () => {
    setPhase('logo');
    // Logo emerges from the pool
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    logoScale.value = withDelay(200, withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.3)) }));
    glowOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Exit after logo is shown
    const exitTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(onFinish)();
      });
    }, 2800);

    return () => clearTimeout(exitTimer);
  };

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Deep background */}
      <LinearGradient
        colors={['#000000', '#080000', '#120003', '#0a0000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Fluid animation canvas */}
      <MetaballFluid onPoolFormed={handlePoolFormed} />

      {/* Logo — emerges from pool */}
      <View style={styles.center} pointerEvents="none">
        {/* Glow halo behind logo */}
        <Animated.View style={[styles.glowHalo, glowStyle]} />

        <PulseRings size={140} color="rgba(220,20,60,0.2)" />

        <Animated.View style={[styles.logoContainer, logoStyle]}>
          {/* तारीख name reveal */}
          <View style={styles.letterRow}>
            <Animated.Text style={styles.appName}>
              तारीख
            </Animated.Text>
          </View>

          <Animated.Text style={[styles.tagline, taglineStyle]}>
            Your cycle, understood.
          </Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: W,
    height: H,
    zIndex: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'transparent',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 0,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterChar: {
    fontSize: 58,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 14,
    textShadowColor: '#DC143C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  appName: {
    fontSize: 58,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: '#DC143C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  tagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    letterSpacing: 4,
    marginTop: 14,
    fontStyle: 'italic',
    textShadowColor: 'rgba(220,20,60,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default SplashScreen;
