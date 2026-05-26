import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../services/api';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

// Pulsing AI orb for insights header
const InsightOrb = () => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 2200, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(220,20,60,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(220,20,60,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  }));
  return (
    <Animated.View style={style}>
      <Ionicons name="sparkles" size={26} color={colors.crimson} />
    </Animated.View>
  );
};

// Animated suggestion item
const SuggestionItem = ({ text, index }) => {
  const opacity = useSharedValue(0);
  const x = useSharedValue(-16);
  useEffect(() => {
    opacity.value = withDelay(index * 120, withTiming(1, { duration: 400 }));
    x.value = withDelay(index * 120, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  return (
    <Animated.View style={[styles.suggestionItem, style]}>
      <LinearGradient
        colors={['rgba(220,20,60,0.12)', 'rgba(80,0,10,0.08)']}
        style={styles.suggestionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.suggestionNumber}>
          <Text style={styles.suggestionNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.suggestionText}>{text}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const AIInsightsScreen = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    aiAPI.getInsights()
      .then((res) => {
        setInsights(res.data.insights);
        contentOpacity.value = withTiming(1, { duration: 600 });
      })
      .catch(() => {
        setInsights({ observation: 'Unable to load insights.', suggestions: [] });
        contentOpacity.value = withTiming(1, { duration: 400 });
      })
      .finally(() => setLoading(false));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <VideoBackground />
        <ActivityIndicator size="large" color={colors.crimson} />
        <Text style={styles.loadingText}>Luna AI is analyzing your cycle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoBackground />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={contentStyle}>
          {/* Header */}
          <View style={styles.header}>
            <InsightOrb />
            <View style={styles.headerText}>
              <Text style={styles.title}>AI Insights</Text>
              <Text style={styles.subtitle}>Powered by Luna AI</Text>
            </View>
          </View>

          {/* Observation card */}
          <LinearGradient
            colors={['rgba(180,0,20,0.2)', 'rgba(80,0,10,0.12)', 'rgba(0,0,0,0.15)']}
            style={styles.observationCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.observationHeader}>
              <Ionicons name="eye-outline" size={14} color={colors.crimson} />
              <Text style={styles.observationLabel}>Observation</Text>
            </View>
            <Text style={styles.observationText}>
              {insights?.observation || 'Log your period to get personalized insights.'}
            </Text>
          </LinearGradient>

          {/* Suggestions */}
          {insights?.suggestions?.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionLabel}>Recommendations</Text>
              {insights.suggestions.map((s, i) => (
                <SuggestionItem key={i} text={s} index={i} />
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.2)" />
            <Text style={styles.disclaimerText}>
              Luna AI provides general wellness information only. Always consult a healthcare professional for medical advice.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  loadingText: { color: '#7D2035', marginTop: 16, fontSize: 14, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  headerText: {},
  title: { color: '#2D0010', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#7D2035', fontSize: 13, marginTop: 2, fontWeight: '600' },
  observationCard: {
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37',
  },
  observationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  observationLabel: { color: '#FFD700', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  observationText: { color: '#FFFFFF', fontSize: 15, lineHeight: 26, fontWeight: '500' },
  suggestionsSection: { marginBottom: 20 },
  sectionLabel: { color: '#000000', fontSize: 18, fontWeight: '900', letterSpacing: 0.5, marginBottom: 12 },
  suggestionItem: { marginBottom: 8, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  suggestionGradient: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  suggestionNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,215,0,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  suggestionNumberText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  suggestionText: { flex: 1, color: '#FFFFFF', fontSize: 14, lineHeight: 22, fontWeight: '500' },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,150,150,0.2)', backgroundColor: '#722F37' },
  disclaimerText: { flex: 1, color: '#FFB3C1', fontSize: 12, lineHeight: 18 },
});

export default AIInsightsScreen;
