import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCycleStore } from '../store/cycleStore';
import InputField from '../components/InputField';
import CrimsonButton from '../components/CrimsonButton';
import DatePicker from '../components/DatePicker';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

const FLOW_OPTIONS = [
  { key: 'spotting',   label: 'Spotting',  color: '#FFB3C1' },
  { key: 'light',      label: 'Light',     color: '#FF8FA3' },
  { key: 'medium',     label: 'Medium',    color: '#DC143C' },
  { key: 'heavy',      label: 'Heavy',     color: '#8B0000' },
  { key: 'very_heavy', label: 'Very Heavy',color: '#4A0010' },
];

const MOOD_OPTIONS = [
  { key: 'happy', emoji: '😊' }, { key: 'sad', emoji: '😢' },
  { key: 'anxious', emoji: '😰' }, { key: 'irritable', emoji: '😤' },
  { key: 'calm', emoji: '😌' }, { key: 'energetic', emoji: '⚡' },
  { key: 'tired', emoji: '😴' },
];

const SYMPTOMS = [
  { key: 'cramps', label: 'Cramps', icon: '⚡' },
  { key: 'moodSwings', label: 'Mood Swings', icon: '🌊' },
  { key: 'acne', label: 'Acne', icon: '🔴' },
  { key: 'fatigue', label: 'Fatigue', icon: '😴' },
  { key: 'headaches', label: 'Headaches', icon: '🤕' },
  { key: 'bloating', label: 'Bloating', icon: '💨' },
  { key: 'backPain', label: 'Back Pain', icon: '🦴' },
  { key: 'breastTenderness', label: 'Tenderness', icon: '💗' },
];

const today = () => new Date().toISOString().split('T')[0];

const SelectChip = ({ label, selected, onPress, color, emoji }) => {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        activeOpacity={1}
      >
        <LinearGradient
          colors={selected ? [color || '#DC143C', (color || '#DC143C') + 'CC'] : ['rgba(220,20,60,0.06)', 'rgba(100,0,10,0.04)']}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AddLogScreen = ({ navigation }) => {
  const { createLog, updateLog, logs, isLoading } = useCycleStore();

  // step: 'choose' | 'start' | 'end'
  const [step, setStep] = useState('choose');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [flow, setFlow] = useState('medium');
  const [mood, setMood] = useState('calm');
  const [symptoms, setSymptoms] = useState({});
  const [notes, setNotes] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');

  // Build blocked months from existing logs
  const blockedMonths = logs.map((log) => {
    const d = new Date(log.startDate);
    return { month: d.getMonth(), year: d.getFullYear() };
  });

  const toggleSymptom = (key) => setSymptoms((s) => ({ ...s, [key]: !s[key] }));

  // Check if a log already exists for the same month/year
  const isDuplicateMonth = (dateStr) => {
    const d = new Date(dateStr);
    return logs.some((log) => {
      const ld = new Date(log.startDate);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    });
  };

  // Find existing log for the same month (for end date update)
  const findLogForMonth = (dateStr) => {
    const d = new Date(dateStr);
    return logs.find((log) => {
      const ld = new Date(log.startDate);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    });
  };

  const handleStartSubmit = () => {
    setError('');
    if (!startDate) { setError('Please select a start date.'); return; }
    if (isDuplicateMonth(startDate)) {
      setError(`A period log for ${new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' })} already exists. Use "Log Period End" to add the end date.`);
      return;
    }
    // Save start-only log
    createLog({ startDate, flowIntensity: flow }).then((result) => {
      if (result.success) {
        navigation.goBack();
      } else {
        setError(result.message || 'Failed to save.');
      }
    });
  };

  const handleEndSubmit = async () => {
    setError('');
    if (!endDate) { setError('Please select an end date.'); return; }

    const existing = findLogForMonth(endDate);
    if (!existing) {
      setError(`No period start found for ${new Date(endDate).toLocaleString('default', { month: 'long', year: 'numeric' })}. Log the start date first.`);
      return;
    }
    if (new Date(endDate) < new Date(existing.startDate)) {
      setError('End date cannot be before the start date.');
      return;
    }

    const result = await updateLog(existing._id, {
      endDate,
      flowIntensity: flow,
      mood,
      symptoms,
      notes,
    });

    if (result.success) {
      if (result.data?.aiInsights?.observation) {
        setAiResult(result.data.aiInsights);
      } else {
        navigation.goBack();
      }
    } else {
      setError(result.message || 'Failed to update log.');
    }
  };

  // AI result screen
  if (aiResult?.observation) {
    return (
      <View style={styles.container}>
        <VideoBackground />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={28} color={colors.crimson} />
            <Text style={styles.aiTitle}>Luna AI Insights</Text>
          </View>
          <LinearGradient colors={['#722F37', '#5C2530']} style={styles.aiCard}>
            <Text style={styles.aiObservation}>{aiResult.observation}</Text>
          </LinearGradient>
          {aiResult.suggestions?.length > 0 && (
            <View style={styles.aiSuggestions}>
              <Text style={styles.sectionLabel}>Recommendations</Text>
              {aiResult.suggestions.map((s, i) => (
                <View key={i} style={styles.aiSuggRow}>
                  <View style={styles.aiSuggDot} />
                  <Text style={styles.aiSuggText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
          <CrimsonButton title="Done" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
        </ScrollView>
      </View>
    );
  }

  // Step: choose start or end
  if (step === 'choose') {
    return (
      <View style={styles.container}>
        <VideoBackground />
        <View style={styles.chooseWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={24} color={colors.crimson} />
          </TouchableOpacity>
          <Text style={styles.chooseTitle}>Log Period</Text>
          <Text style={styles.chooseSubtitle}>What would you like to log?</Text>

          <TouchableOpacity style={styles.chooseCard} onPress={() => setStep('start')} activeOpacity={0.85}>
            <LinearGradient colors={['#722F37', '#5C2530']} style={styles.chooseCardInner}>
              <Ionicons name="play-circle-outline" size={36} color="#FFD700" />
              <Text style={styles.chooseCardTitle}>Period Start</Text>
              <Text style={styles.chooseCardSub}>Log when your period began</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chooseCard} onPress={() => setStep('end')} activeOpacity={0.85}>
            <LinearGradient colors={['#722F37', '#5C2530']} style={styles.chooseCardInner}>
              <Ionicons name="stop-circle-outline" size={36} color="#FFB3C1" />
              <Text style={styles.chooseCardTitle}>Period End</Text>
              <Text style={styles.chooseCardSub}>Log end date, symptoms & get AI insights</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step: log start date
  if (step === 'start') {
    return (
      <View style={styles.container}>
        <VideoBackground />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep('choose')} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.crimson} />
            </TouchableOpacity>
            <Text style={styles.title}>Period Start</Text>
            <View style={{ width: 36 }} />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.section}>
            <DatePicker label="Start Date" value={startDate} onChange={(d) => { setStartDate(d); setError(''); }} placeholder="Select start date" blockedMonths={blockedMonths} />
          </View>

          <CrimsonButton
            title="Save Start Date"
            onPress={handleStartSubmit}
            loading={isLoading}
            style={{ marginTop: 8, marginBottom: 40 }}
          />
        </ScrollView>
      </View>
    );
  }

  // Step: log end date + details
  return (
    <View style={styles.container}>
      <VideoBackground />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('choose')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.crimson} />
          </TouchableOpacity>
          <Text style={styles.title}>Period End</Text>
          <View style={{ width: 36 }} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.section}>
          <DatePicker label="End Date" value={endDate} onChange={(d) => { setEndDate(d); setError(''); }} placeholder="Select end date" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Flow Intensity</Text>
          <View style={styles.chipRow}>
            {FLOW_OPTIONS.map((f) => (
              <SelectChip key={f.key} label={f.label} selected={flow === f.key} onPress={() => setFlow(f.key)} color={f.color} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Symptoms</Text>
          <View style={styles.chipGrid}>
            {SYMPTOMS.map((s) => (
              <SelectChip key={s.key} label={s.label} emoji={s.icon} selected={!!symptoms[s.key]} onPress={() => toggleSymptom(s.key)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mood</Text>
          <View style={styles.chipRow}>
            {MOOD_OPTIONS.map((m) => (
              <SelectChip key={m.key} label={m.key} emoji={m.emoji} selected={mood === m.key} onPress={() => setMood(m.key)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <InputField label="Notes (optional)" icon="create-outline" placeholder="How are you feeling?" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </View>

        <CrimsonButton
          title="Save & Get AI Insights"
          onPress={handleEndSubmit}
          loading={isLoading}
          style={{ marginTop: 4, marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 20, paddingTop: 60 },

  // Choose screen
  chooseWrap: { flex: 1, padding: 24, paddingTop: 60 },
  chooseTitle: { color: '#2D0010', fontSize: 28, fontWeight: '900', marginTop: 16, marginBottom: 6 },
  chooseSubtitle: { color: '#7D2035', fontSize: 14, fontWeight: '500', marginBottom: 32 },
  chooseCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)' },
  chooseCardInner: { padding: 24, alignItems: 'center', gap: 8 },
  chooseCardTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  chooseCardSub: { color: '#FFB3C1', fontSize: 13, textAlign: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#2D0010', fontSize: 20, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionLabel: { color: '#7D2035', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  errorText: { color: '#C2185B', fontSize: 13, fontWeight: '700', marginBottom: 16, backgroundColor: 'rgba(194,24,91,0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(194,24,91,0.3)' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#722F37' },
  chipSelected: { borderColor: 'transparent' },
  chipEmoji: { fontSize: 13 },
  chipText: { color: '#FFB3C1', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#fff', fontWeight: '700' },

  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  aiTitle: { color: '#2D0010', fontSize: 22, fontWeight: '800' },
  aiCard: { borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)' },
  aiObservation: { color: '#FFFFFF', fontSize: 15, lineHeight: 26, fontWeight: '500' },
  aiSuggestions: { marginBottom: 8 },
  aiSuggRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  aiSuggDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700', marginTop: 8, flexShrink: 0 },
  aiSuggText: { flex: 1, color: '#FFFFFF', fontSize: 14, lineHeight: 22, fontWeight: '500' },
});

export default AddLogScreen;
