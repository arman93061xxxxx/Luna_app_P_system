const { chatWithAssistant } = require('../services/aiService');
const Prediction = require('../models/Prediction');
const PeriodLog = require('../models/PeriodLog');

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Build user context
    const prediction = await Prediction.findOne({ userId: req.user._id });
    const recentLog = await PeriodLog.findOne({ userId: req.user._id }).sort({ startDate: -1 });

    const userContext = {
      averageCycleLength: req.user.averageCycleLength || 28,
      currentCycleDay: prediction?.currentCycleDay,
      nextPeriodDate: prediction?.nextPeriodDate,
      lateStatus: prediction?.lateStatus,
      recentSymptoms: recentLog?.symptoms,
    };

    const reply = await chatWithAssistant(message, history, userContext);
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const recentLog = await PeriodLog.findOne({ userId: req.user._id }).sort({ startDate: -1 });
    if (!recentLog) {
      return res.json({
        success: true,
        insights: {
          observation: 'Start logging your periods to get personalized AI insights.',
          suggestions: [
            'Log your first period to begin tracking.',
            'Add symptoms for more detailed analysis.',
            'Consistent tracking leads to better predictions.',
          ],
        },
      });
    }

    res.json({
      success: true,
      insights: {
        observation: recentLog.aiObservation,
        suggestions: recentLog.aiSuggestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { chat, getInsights };
