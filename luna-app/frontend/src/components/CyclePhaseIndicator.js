import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const PHASES = [
  { key: 'menstrual',  label: 'Menstrual',  days: '1–5',   color: '#DC143C', days_range: [1, 5] },
  { key: 'follicular', label: 'Follicular', days: '6–13',  color: '#E8A0BF', days_range: [6, 13] },
  { key: 'ovulation',  label: 'Ovulation',  days: '14',    color: '#FF6B9D', days_range: [14, 14] },
  { key: 'luteal',     label: 'Luteal',     days: '15–28', color: '#C0392B', days_range: [15, 28] },
];

const getPhase = (day) => {
  if (day <= 5) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day === 14) return 'ovulation';
  return 'luteal';
};

const PhaseSegment = ({ phase, isActive, index }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 400 }));
    scale.value = withDelay(index * 80, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    flex: 1,
  }));

  return (
    <Animated.View style={style}>
      <LinearGradient
        colors={isActive
          ? [phase.color, phase.color + 'CC']
          : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
        style={[styles.segment, isActive && styles.segmentActive]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.segLabel, isActive && styles.segLabelActive]}>
          {phase.label}
        </Text>
        <Text style={[styles.segDays, isActive && styles.segDaysActive]}>
          {phase.days}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

const CyclePhaseIndicator = ({ currentDay = 1, cycleLength = 28 }) => {
  const currentPhase = getPhase(currentDay);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cycle Phase</Text>
      <View style={styles.track}>
        {PHASES.map((phase, i) => (
          <PhaseSegment
            key={phase.key}
            phase={phase}
            isActive={currentPhase === phase.key}
            index={i}
          />
        ))}
      </View>
      <Text style={styles.dayText}>Day {currentDay} of {cycleLength}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(139,0,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,20,60,0.14)',
  },
  label: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  track: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  segmentActive: {
    borderColor: 'transparent',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  segLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  segLabelActive: { color: '#fff', fontWeight: '700' },
  segDays: { color: 'rgba(255,255,255,0.2)', fontSize: 8, marginTop: 2, textAlign: 'center' },
  segDaysActive: { color: 'rgba(255,255,255,0.7)' },
  dayText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' },
});

export default CyclePhaseIndicator;
