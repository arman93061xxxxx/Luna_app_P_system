const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add video file extensions
config.resolver.assetExts.push('mp4', 'mov', 'avi');

module.exports = config;
