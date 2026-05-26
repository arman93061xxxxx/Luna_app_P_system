import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSpring, Easing, withRepeat, withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCycleStore } from '../store/cycleStore';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

const { width: W } = Dimensions.get('window');

const flowConfig = {
  spotting:   { color: '#FFB3D9', label: 'Spotting',    dots: 1, emoji: '💧' },
  light:      { color: '#FF8FA3', label: 'Light',       dots: 2, emoji: '💧💧' },
  medium:     { color: '#FF1744', label: 'Medium',      dots: 3, emoji: '💧💧💧' },
  heavy:      { color: '#E91E63', label: 'Heavy',       dots: 4, emoji: '🩸🩸🩸🩸' },
  very_heavy: { color: '#C2185B', label: 'Very Heavy',  dots: 5, emoji: '🩸🩸🩸🩸🩸' },
};

const SYMPTOM_ICONS = {
  cramps: '⚡', moodSwings: '🌊', acne: '🔴', fatigue: '😴',
  headaches: '🤕', bloating: '💨', backPain: '🦴', breastTenderness: '💗',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Flow intensity dots with bounce animation ───────────────────────────────
const FlowDots = ({ intensity }) => {
  const cfg = flowConfig[intensity] || flowConfig.medium;
  
  return (
    <View style={styles.flowDots}>
      {[...Array(5)].map((_, i) => {
        const BounceD = () => {
          const bounce = useSharedValue(1);
          
          useEffect(() => {
            bounce.value = withDelay(
              i * 100,
              withRepeat(
                withSequence(
                  withSpring(1.3, { damping: 2, stiffness: 100 }),
                  withSpring(1, { damping: 2, stiffness: 100 })
                ),
                -1,
                false
              )
            );
          }, []);
          
          const animStyle = useAnimatedStyle(() => ({
            transform: [{ scale: bounce.value }],
          }));
          
          return (
            <Animated.View
              style={[
                styles.flowDot,
                {
                  backgroundColor: i < cfg.dots ? cfg.color : 'rgba(255,255,255,0.15)',
                  shadowColor: i < cfg.dots ? cfg.color : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                },
                animStyle,
              ]}
            />
          );
        };
        
        return <BounceD key={i} />;
      })}
    </View>
  );
};

// ─── Expandable log card ──────────────────────────────────────────────────────
const LogCard = ({ log, onDelete, index }) => {
  const [expanded, setExpanded] = useState(false);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(20);
  const expandHeight = useSharedValue(0);
  const expandOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withDelay(index * 60, withTiming(1, { duration: 400 }));
    cardY.value = withDelay(index * 60, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    expandHeight.value = withSpring(next ? 1 : 0, { damping: 18, stiffness: 120 });
    expandOpacity.value = withTiming(next ? 1 : 0, { duration: 250 });
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value * 200,
    opacity: expandOpacity.value,
    overflow: 'hidden',
  }));

  const duration = log.endDate
    ? Math.ceil((new Date(log.endDate) - new Date(log.startDate)) / (1000 * 60 * 60 * 24)) + 1
    : null;

  const activeSymptoms = Object.entries(log.symptoms || {})
    .filter(([, v]) => v)
    .map(([k]) => ({ key: k, icon: SYMPTOM_ICONS[k] || '•', label: k.replace(/([A-Z])/g, ' $1') }));

  const cfg = flowConfig[log.flowIntensity] || flowConfig.medium;
  const isLate = log.lateStatus;
  const isMissed = log.missedStatus;

  return (
    <Animated.View style={cardStyle}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
        <LinearGradient
          colors={['rgba(255, 23, 68, 0.15)', 'rgba(233, 30, 99, 0.1)', 'rgba(194, 24, 91, 0.08)']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Status badges */}
          {(isLate || isMissed) && (
            <View style={[styles.statusBadge, { backgroundColor: isMissed ? 'rgba(231,76,60,0.2)' : 'rgba(243,156,18,0.2)' }]}>
              <Text style={[styles.statusBadgeText, { color: isMissed ? colors.danger : colors.warning }]}>
                {isMissed ? '⚠ Missed' : '⏰ Late'}
              </Text>
            </View>
          )}

          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardDateBlock}>
              <View style={[styles.flowIndicator, { backgroundColor: cfg.color }]} />
              <View>
                <Text style={styles.cardDate}>
                  {formatDate(log.startDate)}
                  {log.endDate ? <Text style={styles.cardDateArrow}> → {formatDate(log.endDate)}</Text> : <Text style={styles.cardDatePending}> (ongoing)</Text>}
                </Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              {duration && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{duration}d</Text>
                </View>
              )}
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {/* Flow dots + mood */}
          <View style={styles.cardRow}>
            <FlowDots intensity={log.flowIntensity} />
            <View style={styles.moodBadge}>
              <Text style={styles.moodText}>{log.mood}</Text>
            </View>
          </View>

          {/* Expandable detail */}
          <Animated.View style={expandStyle} pointerEvents={expanded ? 'auto' : 'none'}>
            <View style={styles.expandDivider} />

            {activeSymptoms.length > 0 && (
              <View style={styles.symptomsRow}>
                {activeSymptoms.map((s) => (
                  <View key={s.key} style={styles.symptomChip}>
                    <Text style={styles.symptomIcon}>{s.icon}</Text>
                    <Text style={styles.symptomLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {log.notes ? (
              <Text style={styles.notes}>"{log.notes}"</Text>
            ) : null}

            {log.aiObservation && (
              <View style={styles.aiNote}>
                <Ionicons name="sparkles" size={12} color={colors.crimson} />
                <Text style={styles.aiNoteText}>{log.aiObservation}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Delete button pressed for log:', log._id);
                onDelete(log._id);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="rgba(255,100,100,0.5)" />
              <Text style={styles.deleteBtnText}>Delete log</Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const HistoryScreen = () => {
  const { logs, fetchLogs, deleteLog, isLoading } = useCycleStore();

  useEffect(() => { fetchLogs({ limit: 50 }); }, []);

  const handleDelete = async (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Remove this period log?')) {
        const result = await deleteLog(id);
        if (!result.success) window.alert('Error: ' + (result.message || 'Failed to delete log'));
      }
    } else {
      Alert.alert('Delete Log', 'Remove this period log?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            const result = await deleteLog(id);
            if (!result.success) Alert.alert('Error', result.message || 'Failed to delete log');
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackground />
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <LogCard log={item} onDelete={handleDelete} index={index} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.title}>🩸 History</Text>
            <Text style={styles.subtitle}>{logs.length} cycles tracked</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🩸</Text>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyText}>Start tracking your cycle to see history here.</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={() => fetchLogs({ limit: 50 })}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  listHeader: { marginBottom: 20 },
  title: { color: '#2D0010', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#7D2035', fontSize: 14, marginTop: 4, fontWeight: '600' },

  card: {
    borderRadius: 24, padding: 18, marginBottom: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', overflow: 'hidden',
    backgroundColor: '#722F37',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardDateBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flowIndicator: { width: 5, height: 40, borderRadius: 3, shadowColor: '#FF1744', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 },
  cardDate: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardDateArrow: { color: '#FFD700', fontSize: 15, fontWeight: '700' },
  cardDatePending: { color: '#FFB3C1', fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(220,20,60,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(180,0,30,0.3)',
  },
  durationText: { color: '#C2185B', fontSize: 13, fontWeight: '700' },

  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flowDots: { flexDirection: 'row', gap: 6 },
  flowDot: { width: 10, height: 10, borderRadius: 5 },
  moodBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,150,150,0.4)', backgroundColor: 'rgba(255,255,255,0.15)',
  },
  moodText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  expandDivider: { height: 1, backgroundColor: 'rgba(255,150,150,0.3)', marginVertical: 14, borderRadius: 1 },
  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,150,150,0.4)', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  symptomIcon: { fontSize: 14 },
  symptomLabel: { color: '#FFFFFF', fontSize: 12, textTransform: 'capitalize', fontWeight: '600' },
  notes: { color: '#FFD0D8', fontSize: 14, fontStyle: 'italic', marginBottom: 12, lineHeight: 22 },
  aiNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12,
    borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  aiNoteText: { flex: 1, color: '#FFFFFF', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end', paddingVertical: 6 },
  deleteBtnText: { color: '#FFD700', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { color: '#2D0010', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#7D2035', fontSize: 15, textAlign: 'center', lineHeight: 24 },
});

export default HistoryScreen;
