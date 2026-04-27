const PeriodLog = require('../models/PeriodLog');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { calculatePredictions } = require('../utils/cycleCalculator');
const { generateCycleInsights } = require('../services/aiService');

const refreshPredictions = async (userId) => {
  const logs = await PeriodLog.find({ userId }).sort({ startDate: -1 }).limit(12);
  const user = await User.findById(userId);
  const predictions = calculatePredictions(logs, user);

  await Prediction.findOneAndUpdate(
    { userId },
    { ...predictions, lastCalculated: new Date() },
    { upsert: true, new: true }
  );

  // Update user's average cycle length
  await User.findByIdAndUpdate(userId, { averageCycleLength: predictions.averageCycleLength });

  return predictions;
};

const createLog = async (req, res) => {
  try {
    console.log('Creating log for user:', req.user._id, 'with data:', req.body);
    const { startDate, endDate, flowIntensity, symptoms, mood, notes } = req.body;

    const log = await PeriodLog.create({
      userId: req.user._id,
      startDate,
      endDate,
      flowIntensity,
      symptoms,
      mood,
      notes,
    });

    // Refresh predictions
    const recentLogs = await PeriodLog.find({ userId: req.user._id }).sort({ startDate: -1 }).limit(12);
    const predictions = await refreshPredictions(req.user._id);

    // Generate AI insights asynchronously (don't block on errors)
    generateCycleInsights(log, predictions, recentLogs)
      .then((aiResult) => {
        if (aiResult.observation) {
          log.aiObservation = aiResult.observation;
          log.aiSuggestions = aiResult.suggestions || [];
          log.save().catch(() => {});
        }
      })
      .catch(() => {});

    res.status(201).json({
      success: true,
      log,
      predictions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLog = async (req, res) => {
  try {
    const log = await PeriodLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    Object.assign(log, req.body);
    await log.save();

    await refreshPredictions(req.user._id);
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLog = async (req, res) => {
  try {
    console.log('Deleting log:', req.params.id, 'for user:', req.user._id);
    const log = await PeriodLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) {
      console.log('Log not found');
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    console.log('Log deleted successfully');
    await refreshPredictions(req.user._id);
    res.json({ success: true, message: 'Log deleted' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, year, month } = req.query;
    const query = { userId: req.user._id };

    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.startDate = { $gte: start, $lte: end };
    }

    const logs = await PeriodLog.find(query)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PeriodLog.countDocuments(query);

    res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPredictions = async (req, res) => {
  try {
    let prediction = await Prediction.findOne({ userId: req.user._id });
    if (!prediction) {
      await refreshPredictions(req.user._id);
      prediction = await Prediction.findOne({ userId: req.user._id });
    }
    res.json({ success: true, predictions: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLog, updateLog, deleteLog, getLogs, getPredictions };
