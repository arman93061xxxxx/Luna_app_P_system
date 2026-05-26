import React from 'react';
import { StyleSheet, Platform, Image } from 'react-native';

// Uses pink.png as background on all platforms
// Web: served from /public/pink.png
// Native: bundled from assets/pink.png

const VideoBackground = () => {
  if (Platform.OS === 'web') {
    return (
      <img
        src="/pink.png"
        alt=""
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
    );
  }

  // Android & iOS — use React Native Image
  return (
    <Image
      source={require('../../assets/pink.png')}
      style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      resizeMode="cover"
      fadeDuration={0}
    />
  );
};

export default VideoBackground;
