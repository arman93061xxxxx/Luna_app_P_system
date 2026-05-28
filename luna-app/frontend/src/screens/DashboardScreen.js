import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing, withDelay, interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useCycleStore } from '../store/cycleStore';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';
import { ms, rf, rp, isTablet } from '../utils/responsive';

// Circular cycle ring using pure RN
const CycleRing = ({ currentDay, cycleLength, size = 180 }) => {
  const pct = Math.min(1, (currentDay || 1) / (cycleLength || 28));
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.sine) })
      ),
      -1, false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0.3, 0.8]),
    shadowRadius: interpolate(glow.value, [0, 1], [8, 20]),
  }));

  const strokeW = 10;
  const r = size / 2 - strokeW;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track ring */}
      <View style={{
        position: 'absolute',
        width: size - strokeW,
        height: size - strokeW,
        borderRadius: (size - strokeW) / 2,
        borderWidth: strokeW,
        borderColor: 'rgba(139,0,0,0.2)',
      }} />
      {/* Progress arc approximation using gradient border */}
      <Animated.View style={[{
        position: 'absolute',
        width: size - strokeW,
        height: size - strokeW,
        borderRadius: (size - strokeW) / 2,
        borderWidth: strokeW,
        borderColor: 'transparent',
        borderTopColor: colors.crimson,
        borderRightColor: pct > 0.25 ? colors.crimson : 'transparent',
        borderBottomColor: pct > 0.5 ? colors.crimson : 'transparent',
        borderLeftColor: pct > 0.75 ? colors.crimson : 'transparent',
        transform: [{ rotate: '-90deg' }],
        shadowColor: '#DC143C',
        shadowOffset: { width: 0, height: 0 },
      }, glowStyle]} />
      {/* Center text */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '800' }}>{currentDay}</Text>
        <Text style={{ color: '#FFB3C1', fontSize: 11 }}>of {cycleLength}</Text>
      </View>
    </View>
  );
};

// Heartbeat line
const HeartbeatLine = () => {
  const { width: W } = useWindowDimensions();
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1, false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(offset.value, [0, 1], [0, -W]) }],
  }));

  return (
    <View style={{ height: 32, overflow: 'hidden', marginTop: 12 }}>
      <Animated.View style={[{ flexDirection: 'row', width: W * 2 }, style]}>
        {[0, 1].map((k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', width: W }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(220,20,60,0.3)' }} />
            <View style={{ width: 2, height: 28, backgroundColor: colors.crimson, marginHorizontal: 2 }} />
            <View style={{ width: 2, height: 14, backgroundColor: colors.crimson, marginHorizontal: 1 }} />
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(220,20,60,0.3)' }} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const StatCard = ({ label, value, icon, color = colors.crimson, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const y = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    y.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
    flex: 1,
  }));

  return (
    <Animated.View style={style}>
      <LinearGradient
        colors={['#722F37', '#5C2530']}
        style={styles.statCard}
      >
        <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
};
const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const DashboardScreen = ({ navigation }) => {
  const { width: W } = useWindowDimensions();
  const ringSize = isTablet ? 200 : Math.min(150, W * 0.4);
  const { user } = useAuthStore();
  const { predictions, fetchPredictions, fetchLogs, isLoading } = useCycleStore();

  console.log('DashboardScreen render - width:', W, 'isTablet:', isTablet, 'ringSize:', ringSize);

  const headerOpacity = useSharedValue(0);
  const fabScale = useSharedValue(1);

  useEffect(() => {
    console.log('DashboardScreen mounted');
    fetchPredictions();
    fetchLogs({ limit: 5 });
    headerOpacity.value = withTiming(1, { duration: 600 });
    fabScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sine) })
      ),
      -1, false
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  const daysLeft = daysUntil(predictions?.nextPeriodDate);
  const isLate = predictions?.lateStatus;
  const isMissed = predictions?.missedStatus;
  const periodStatus = isMissed ? 'Missed' : isLate ? 'Late' : daysLeft !== null ? `${Math.abs(daysLeft)}` : '—';
  const periodColor = isMissed ? colors.danger : isLate ? colors.warning : colors.crimson;
  const cycleDay = predictions?.currentCycleDay || 1;
  const cycleLen = predictions?.averageCycleLength || 28;

  console.log('Dashboard data:', { cycleDay, cycleLen, periodStatus, user: user?.name });

  // Safety check for mobile
  if (!W || W < 100) {
    console.error('Invalid window width:', W);
    return (
      <View style={styles.container}>
        <VideoBackground />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { fetchPredictions(); fetchLogs(); }} tintColor={colors.crimson} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Luna'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={[colors.bloodRed, colors.deepMaroon]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'L'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero card */}
        <LinearGradient
          colors={['#722F37', '#5C2530']}
          style={styles.heroCard}
        >
          <View style={styles.heroInner}>
            <CycleRing currentDay={cycleDay} cycleLength={cycleLen} size={ringSize} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroSectionLabel}>
                {isLate ? 'Period Late' : isMissed ? 'Missed' : daysLeft > 0 ? 'Next Period' : 'Expected'}
              </Text>
              <Text style={[styles.heroCountdown, { color: periodColor }]}>{periodStatus}</Text>
              {!isLate && !isMissed && daysLeft !== null && (
                <Text style={styles.heroUnit}>days</Text>
              )}
              <Text style={styles.heroDate}>{formatDate(predictions?.nextPeriodDate)}</Text>
              <View style={styles.heroDivider} />
              <Text style={styles.heroSectionLabel}>Ovulation</Text>
              <Text style={styles.heroSubValue}>{formatDate(predictions?.ovulationDate)}</Text>
            </View>
          </View>
          <HeartbeatLine />
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Fertile Start" value={formatDate(predictions?.fertileWindow?.start)} icon="leaf-outline" color="#FF6B9D" delay={100} />
          <View style={{ width: 10 }} />
          <StatCard label="Fertile End" value={formatDate(predictions?.fertileWindow?.end)} icon="heart-outline" color={colors.fertile} delay={200} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Avg Cycle" value={`${cycleLen}d`} icon="sync-outline" color={colors.lightCrimson} delay={300} />
          <View style={{ width: 10 }} />
          <StatCard label="Regularity" value={`${Math.max(0, 100 - (predictions?.irregularityScore || 0))}%`} icon="analytics-outline" color="#4CAF50" delay={400} />
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Animated.View style={[{ flex: 1 }, fabStyle]}>
            <TouchableOpacity onPress={() => navigation.navigate('AddLog')} activeOpacity={0.85}>
              <LinearGradient colors={['#FF2D55', '#DC143C', '#8B0000']} style={styles.fab}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.fabText}>Log Period</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('AIChat')} activeOpacity={0.8}>
            <LinearGradient colors={['rgba(220,20,60,0.15)', 'rgba(100,0,15,0.1)']} style={styles.chatBtnInner}>
              <Ionicons name="sparkles" size={18} color={colors.crimson} />
              <Text style={styles.chatBtnText}>Ask Luna AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: rp(20), paddingTop: rp(60), paddingBottom: rp(110) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rp(24) },
  greeting: { color: '#7D2035', fontSize: rf(13), fontWeight: '600' },
  name: { color: '#2D0010', fontSize: rf(26), fontWeight: '800' },
  avatar: { width: ms(46), height: ms(46), borderRadius: ms(23), alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(220,20,60,0.6)' },
  avatarText: { color: '#fff', fontSize: rf(18), fontWeight: '700' },
  heroCard: { borderRadius: 24, padding: rp(18), marginBottom: rp(14), borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  heroInner: { flexDirection: 'row', alignItems: 'center', gap: rp(12) },
  heroInfo: { flex: 1 },
  heroSectionLabel: { color: '#FFB3C1', fontSize: rf(10), letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2, fontWeight: '700' },
  heroCountdown: { fontSize: rf(38), fontWeight: '800', letterSpacing: -1 },
  heroUnit: { color: '#FFD0D8', fontSize: rf(13), fontWeight: '600' },
  heroDate: { color: '#FFD0D8', fontSize: rf(13), marginTop: 2, fontWeight: '500' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,150,150,0.3)', marginVertical: rp(8) },
  heroSubValue: { color: '#FFD700', fontSize: rf(15), fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginBottom: rp(10) },
  statCard: { borderRadius: 18, padding: rp(14), borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', alignItems: 'center', backgroundColor: '#722F37' },
  statIcon: { width: ms(34), height: ms(34), borderRadius: ms(17), alignItems: 'center', justifyContent: 'center', marginBottom: rp(6), backgroundColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontSize: rf(15), fontWeight: '700', textAlign: 'center' },
  statLabel: { color: '#FFB3C1', fontSize: rf(10), textAlign: 'center', marginTop: 3, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: rp(12), marginTop: rp(6) },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: rp(15), borderRadius: 16 },
  fabText: { color: '#fff', fontSize: rf(14), fontWeight: '700' },
  chatBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  chatBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: rp(15) },
  chatBtnText: { color: '#FFD700', fontSize: rf(14), fontWeight: '700' },
});

export default DashboardScreen;
