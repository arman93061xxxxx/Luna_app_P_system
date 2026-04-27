const mongoose = require('mongoose');

const periodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  flowIntensity: {
    type: String,
    enum: ['spotting', 'light', 'medium', 'heavy', 'very_heavy'],
    default: 'medium',
  },
  symptoms: {
    cramps: { type: Boolean, default: false },
    moodSwings: { type: Boolean, default: false },
    acne: { type: Boolean, default: false },
    fatigue: { type: Boolean, default: false },
    headaches: { type: Boolean, default: false },
    bloating: { type: Boolean, default: false },
    backPain: { type: Boolean, default: false },
    breastTenderness: { type: Boolean, default: false },
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'irritable', 'calm', 'energetic', 'tired'],
    default: 'calm',
  },
  notes: { type: String, maxlength: 500 },
  aiObservation: { type: String, default: null },
  aiSuggestions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

periodLogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PeriodLog', periodLogSchema);
