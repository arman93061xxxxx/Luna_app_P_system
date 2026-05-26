import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Video } from 'expo-av';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

const AuthScreen = ({ navigation }) => {
  // On Android/iOS: skip video, show form immediately
  // On Web: play video first, then show form
  const [videoFinished, setVideoFinished] = useState(Platform.OS !== 'web');
  const [currentScreen, setCurrentScreen] = useState('Login');
  const videoRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // If video fails to play on web, show form anyway
        setVideoFinished(true);
      });
    }
  }, []);

  const handleVideoEnd = () => setVideoFinished(true);

  const mockNavigation = {
    navigate: (screen) => {
      if (screen === 'ForgotPassword') {
        navigation.navigate('ForgotPassword');
      } else {
        setCurrentScreen(screen);
      }
    },
  };

  return (
    <View style={styles.container}>
      {/* Video — web only (webm not supported on Android) */}
      {Platform.OS === 'web' && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="/login.webm" type="video/webm" />
        </video>
      )}

      {/* Native (Android/iOS) — MP4 supported */}
      {Platform.OS !== 'web' && (
        <Video
          ref={videoRef}
          source={require('../../assets/login.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          isMuted
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish || status.error) {
              handleVideoEnd();
            }
          }}
          onError={() => handleVideoEnd()}
        />
      )}

      {currentScreen === 'Login' ? (
        <LoginScreen navigation={mockNavigation} videoFinished={videoFinished} />
      ) : (
        <SignupScreen navigation={mockNavigation} videoFinished={videoFinished} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0008' },
});

export default AuthScreen;
