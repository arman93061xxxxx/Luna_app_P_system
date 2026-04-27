const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  nextPeriodDate: { type: Date, default: null },
  ovulationDate: { type: Date, default: null },
  fertileWindow: {
    start: { type: Date, default: null },
    end: { type: Date, default: null },
  },
  currentCycleDay: { type: Number, default: null },
  lateStatus: { type: Boolean, default: false },
  missedStatus: { type: Boolean, default: false },
  averageCycleLength: { type: Number, default: 28 },
  irregularityScore: { type: Number, default: 0 }, // 0-100
  lastCalculated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prediction', predictionSchema);
