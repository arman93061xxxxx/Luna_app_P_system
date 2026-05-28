const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Prediction = require('../models/Prediction');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const signup = async (req, res) => {
  try {
    const { name, email, password, age, averageCycleLength } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, age, averageCycleLength });

    // Create empty prediction record
    await Prediction.create({ userId: user._id });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, age, dateOfBirth, profilePhoto, averageCycleLength, notificationPreferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (averageCycleLength) updateData.averageCycleLength = averageCycleLength;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    
    // Handle age/dateOfBirth
    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
      // Age will be calculated automatically
    } else if (age) {
      updateData.age = age;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In production, send email with reset link
    // For now, we'll return the token (in production, never do this!)
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    console.log('Password reset token:', resetToken);
    console.log('Reset URL:', resetURL);

    // Simulate email sending
    res.json({
      success: true,
      message: 'Password reset token sent to email',
      resetToken, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, token, user, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { signup, login, logout, getMe, updateProfile, forgotPassword, resetPassword };
