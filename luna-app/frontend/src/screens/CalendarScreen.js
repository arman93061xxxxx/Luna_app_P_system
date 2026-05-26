import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { useCycleStore } from '../store/cycleStore';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

const formatDateStr = (d) => new Date(d).toISOString().split('T')[0];

const buildMarkedDates = (logs, predictions, visibleMonth) => {
  const marked = {};
  const vm = visibleMonth || { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  logs.forEach((log) => {
    const start = new Date(log.startDate);
    const end = log.endDate ? new Date(log.endDate) : new Date(log.startDate);
    let cur = new Date(start);
    while (cur <= end) {
      const key = formatDateStr(cur);
      // only highlight if date belongs to the currently viewed month
      const inView = (cur.getMonth() + 1) === vm.month && cur.getFullYear() === vm.year;
      marked[key] = {
        color: inView ? '#DC143C' : 'transparent',
        textColor: inView ? '#fff' : 'rgba(255,255,255,0.12)',
        startingDay: formatDateStr(cur) === formatDateStr(start),
        endingDay: formatDateStr(cur) === formatDateStr(end),
      };
      cur.setDate(cur.getDate() + 1);
    }
  });

  if (predictions?.fertileWindow?.start && predictions?.fertileWindow?.end) {
    let cur = new Date(predictions.fertileWindow.start);
    const end = new Date(predictions.fertileWindow.end);
    while (cur <= end) {
      const key = formatDateStr(cur);
      if (!marked[key]) {
        marked[key] = {
          color: 'rgba(255,107,157,0.35)',
          textColor: '#fff',
          startingDay: formatDateStr(cur) === formatDateStr(predictions.fertileWindow.start),
          endingDay: formatDateStr(cur) === formatDateStr(predictions.fertileWindow.end),
        };
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  if (predictions?.ovulationDate) {
    const key = formatDateStr(predictions.ovulationDate);
    marked[key] = { selected: true, selectedColor: '#FF6B9D', dotColor: '#fff', marked: true };
  }

  if (predictions?.nextPeriodDate) {
    const key = formatDateStr(predictions.nextPeriodDate);
    if (!marked[key]) {
      marked[key] = { selected: true, selectedColor: 'rgba(220,20,60,0.35)', dotColor: colors.crimson };
    }
  }

  return marked;
};

const LEGEND = [
  { color: '#DC143C', label: 'Period days', shape: 'pill' },
  { color: '#FF6B9D', label: 'Ovulation', shape: 'circle' },
  { color: 'rgba(255,107,157,0.5)', label: 'Fertile window', shape: 'pill' },
  { color: 'rgba(220,20,60,0.4)', label: 'Predicted period', shape: 'circle' },
];

const CalendarScreen = () => {
  const { logs, predictions, fetchLogs, fetchPredictions } = useCycleStore();
  const [markedDates, setMarkedDates] = useState({});
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);

  useEffect(() => {
    fetchLogs({ limit: 50 });
    fetchPredictions();
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
  }, []);

  useEffect(() => {
    setMarkedDates(buildMarkedDates(logs, predictions, visibleMonth));
  }, [logs, predictions, visibleMonth]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <View style={styles.container}>
      <VideoBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Your cycle at a glance</Text>

          {/* Calendar */}
          <View style={styles.calendarWrap}>
            <LinearGradient
              colors={['transparent', 'transparent']}
              style={styles.calendarGradient}
            >
              <Calendar
                markingType="period"
                markedDates={markedDates}
                onMonthChange={(month) => setVisibleMonth({ month: month.month, year: month.year })}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#FFB3C1',
                  selectedDayBackgroundColor: '#FF1744',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#FFD700',
                  todayBackgroundColor: 'rgba(255,215,0,0.2)',
                  dayTextColor: '#FFFFFF',
                  textDisabledColor: 'rgba(255,255,255,0.08)',
                  dotColor: '#FFD700',
                  selectedDotColor: '#fff',
                  monthTextColor: '#FFFFFF',
                  indicatorColor: '#FF1744',
                  arrowColor: '#FFD700',
                  textMonthFontWeight: '800',
                  textMonthFontSize: 17,
                  textDayFontSize: 14,
                  textDayHeaderFontSize: 12,
                  textDayHeaderFontWeight: '700',
                  'stylesheet.calendar.header': {
                    week: {
                      marginTop: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    },
                  },
                }}
              />
            </LinearGradient>
          </View>

          {/* Legend */}
          <LinearGradient
            colors={['rgba(139,0,0,0.14)', 'rgba(40,0,8,0.08)']}
            style={styles.legend}
          >
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendGrid}>
              {LEGEND.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendSwatch,
                      { backgroundColor: item.color },
                      item.shape === 'pill' && styles.legendPill,
                    ]}
                  />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Phase summary */}
          {predictions?.currentCycleDay && (
            <LinearGradient
              colors={['rgba(220,20,60,0.12)', 'rgba(80,0,10,0.08)']}
              style={styles.phaseSummary}
            >
              <Text style={styles.phaseTitle}>Current Phase</Text>
              <View style={styles.phaseRow}>
                {[
                  { label: 'Cycle Day', value: predictions.currentCycleDay },
                  { label: 'Avg Length', value: `${predictions.averageCycleLength || 28}d` },
                  { label: 'Regularity', value: `${Math.max(0, 100 - (predictions.irregularityScore || 0))}%` },
                ].map((item) => (
                  <View key={item.label} style={styles.phaseItem}>
                    <Text style={styles.phaseValue}>{item.value}</Text>
                    <Text style={styles.phaseLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  title: { color: '#2D0010', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#7D2035', fontSize: 13, marginTop: 2, marginBottom: 20, fontWeight: '600' },

  calendarWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  calendarGradient: { padding: 8 },

  legend: { borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  legendTitle: { color: '#FFB3C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' },
  legendSwatch: { width: 12, height: 12, borderRadius: 6 },
  legendPill: { width: 20, height: 8, borderRadius: 4 },
  legendLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  phaseSummary: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  phaseTitle: { color: '#FFB3C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-around' },
  phaseItem: { alignItems: 'center' },
  phaseValue: { color: '#FFD700', fontSize: 22, fontWeight: '800' },
  phaseLabel: { color: '#FFB3C1', fontSize: 11, marginTop: 2, fontWeight: '600' },
});

export default CalendarScreen;
