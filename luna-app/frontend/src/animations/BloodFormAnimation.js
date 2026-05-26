import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

const BloodDrip = ({ delay, left, length, speed }) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    height.value = withDelay(
      delay,
      withTiming(length, { duration: speed, easing: Easing.bezier(0.4, 0, 0.6, 1) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.drip, { left }, animStyle]}>
      <LinearGradient
        colors={['#FF1744', '#E91E63', '#C2185B']}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

const BloodFormAnimation = ({ onComplete, children }) => {
  // Main blood drop from top
  const mainDropY = useSharedValue(-100);
  const mainDropScale = useSharedValue(0.3);
  const mainDropOpacity = useSharedValue(0);

  // Card formation
  const cardWidth = useSharedValue(60);
  const cardHeight = useSharedValue(60);
  const cardOpacity = useSharedValue(0);
  const cardBorderRadius = useSharedValue(30);

  // Content reveal
  const contentOpacity = useSharedValue(0);

  // Boundary drips
  const boundaryDripsOpacity = useSharedValue(0);

  useEffect(() => {
    // Phase 1: Main drop appears and falls (0-1.5s)
    mainDropOpacity.value = withTiming(1, { duration: 300 });
    mainDropScale.value = withTiming(1, { duration: 300 });
    mainDropY.value = withDelay(
      300,
      withTiming(H * 0.35, { duration: 1200, easing: Easing.bezier(0.6, 0, 0.4, 1) })
    );

    // Phase 2: Drop expands into card shape (1.5-3.5s)
    cardOpacity.value = withDelay(1500, withTiming(1, { duration: 400 }));
    cardWidth.value = withDelay(
      1500,
      withTiming(W * 0.85, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );
    cardHeight.value = withDelay(
      1500,
      withTiming(480, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );
    cardBorderRadius.value = withDelay(
      1500,
      withTiming(24, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );

    // Phase 3: Boundary drips appear (3.5-5s)
    boundaryDripsOpacity.value = withDelay(3500, withTiming(1, { duration: 800 }));

    // Phase 4: Content fades in (5.5-7s)
    contentOpacity.value = withDelay(
      5500,
      withTiming(1, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const mainDropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mainDropY.value }, { scale: mainDropScale.value }],
    opacity: mainDropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    width: cardWidth.value,
    height: cardHeight.value,
    borderRadius: cardBorderRadius.value,
    opacity: cardOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const boundaryDripsStyle = useAnimatedStyle(() => ({
    opacity: boundaryDripsOpacity.value,
  }));

  // Boundary drip positions
  const topDrips = [
    { delay: 3500, left: '15%', length: 40, speed: 800 },
    { delay: 3700, left: '35%', length: 30, speed: 700 },
    { delay: 3600, left: '55%', length: 35, speed: 750 },
    { delay: 3800, left: '75%', length: 45, speed: 850 },
    { delay: 3650, left: '85%', length: 25, speed: 650 },
  ];

  const bottomDrips = [
    { delay: 4000, left: '20%', length: 50, speed: 900 },
    { delay: 4200, left: '40%', length: 40, speed: 800 },
    { delay: 4100, left: '60%', length: 45, speed: 850 },
    { delay: 4300, left: '80%', length: 35, speed: 750 },
  ];

  return (
    <View style={styles.container}>
      {/* Main blood drop */}
      <Animated.View style={[styles.mainDrop, mainDropStyle]}>
        <LinearGradient
          colors={['#FF1744', '#E91E63']}
          style={styles.dropGradient}
        >
          <View style={styles.dropHighlight} />
        </LinearGradient>
      </Animated.View>

      {/* Card formation */}
      <Animated.View style={[styles.card, cardStyle]}>
        <LinearGradient
          colors={['rgba(255, 23, 68, 0.25)', 'rgba(233, 30, 99, 0.2)', 'rgba(194, 24, 91, 0.15)']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Top boundary drips */}
        <Animated.View style={[styles.topDripsContainer, boundaryDripsStyle]}>
          {topDrips.map((drip, i) => (
            <BloodDrip key={`top-${i}`} {...drip} />
          ))}
        </Animated.View>

        {/* Bottom boundary drips */}
        <Animated.View style={[styles.bottomDripsContainer, boundaryDripsStyle]}>
          {bottomDrips.map((drip, i) => (
            <BloodDrip key={`bottom-${i}`} {...drip} />
          ))}
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainDrop: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 100,
    borderRadius: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  dropGradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  dropHighlight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 15,
    marginLeft: 20,
  },
  card: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255, 64, 129, 0.4)',
    overflow: 'visible',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  topDripsContainer: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    height: 60,
  },
  bottomDripsContainer: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 60,
  },
  drip: {
    position: 'absolute',
    top: 0,
    width: 8,
    borderRadius: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});

export default BloodFormAnimation;
