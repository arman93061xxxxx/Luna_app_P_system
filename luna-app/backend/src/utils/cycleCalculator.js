/**
 * Core cycle calculation utilities
 */

const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round(Math.abs((d2 - d1) / (1000 * 60 * 60 * 24)));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate average cycle length from period logs
 */
const calculateAverageCycleLength = (logs) => {
  if (!logs || logs.length < 2) return 28;
  const sorted = [...logs].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (len >= 15 && len <= 60) cycleLengths.push(len); // filter outliers
  }
  if (cycleLengths.length === 0) return 28;
  return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
};

/**
 * Calculate all predictions from logs
 */
const calculatePredictions = (logs, user) => {
  const now = new Date();
  if (!logs || logs.length === 0) {
    return {
      nextPeriodDate: null,
      ovulationDate: null,
      fertileWindow: { start: null, end: null },
      currentCycleDay: null,
      lateStatus: false,
      missedStatus: false,
      averageCycleLength: user.averageCycleLength || 28,
      irregularityScore: 0,
    };
  }

  const sorted = [...logs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const lastPeriod = sorted[0];
  const avgCycle = calculateAverageCycleLength(logs);

  const lastStart = new Date(lastPeriod.startDate);
  const nextPeriodDate = addDays(lastStart, avgCycle);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileWindow = {
    start: addDays(ovulationDate, -5),
    end: addDays(ovulationDate, 1),
  };

  const currentCycleDay = daysBetween(lastStart, now) + 1;
  const daysOverdue = daysBetween(nextPeriodDate, now);
  const lateStatus = now > nextPeriodDate && daysOverdue >= 5;
  const missedStatus = now > nextPeriodDate && daysOverdue >= avgCycle;

  // Irregularity: std deviation of cycle lengths
  let irregularityScore = 0;
  if (logs.length >= 3) {
    const sortedAsc = [...logs].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const lengths = [];
    for (let i = 1; i < sortedAsc.length; i++) {
      const len = daysBetween(sortedAsc[i - 1].startDate, sortedAsc[i].startDate);
      if (len >= 15 && len <= 60) lengths.push(len);
    }
    if (lengths.length > 1) {
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);
      irregularityScore = Math.min(100, Math.round(stdDev * 10));
    }
  }

  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindow,
    currentCycleDay,
    lateStatus,
    missedStatus,
    averageCycleLength: avgCycle,
    irregularityScore,
  };
};

module.exports = { calculatePredictions, calculateAverageCycleLength, daysBetween, addDays };
