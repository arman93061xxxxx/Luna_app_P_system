const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  profilePhoto: { type: String, default: null }, // Base64 image or URL
  dateOfBirth: { type: Date, default: null },
  age: { type: Number, min: 10, max: 60 },
  averageCycleLength: { type: Number, default: 28 },
  averagePeriodLength: { type: Number, default: 5 },
  passwordResetToken: String,
  passwordResetExpires: Date,
  notificationPreferences: {
    periodReminder: { type: Boolean, default: true },
    ovulationReminder: { type: Boolean, default: true },
    fertileWindowReminder: { type: Boolean, default: true },
    reminderDaysBefore: { type: Number, default: 2 },
    fcmToken: { type: String, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

// Calculate age from date of birth
userSchema.virtual('calculatedAge').get(function () {
  if (!this.dateOfBirth) return this.age;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Never return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  // Use calculated age if dateOfBirth exists
  if (this.dateOfBirth) {
    obj.age = this.calculatedAge;
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
