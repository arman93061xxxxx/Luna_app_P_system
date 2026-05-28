import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

const AuthScreen = ({ navigation }) => {
  // Always start false — wait for video to finish on ALL platforms
  const [videoFinished, setVideoFinished] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const videoRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.play().catch(() => setVideoFinished(true));
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
      {/* Video background — fixed, never resizes with keyboard */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
          }}
        >
          <source src="/login.webm" type="video/webm" />
          <source src="/login.mp4" type="video/mp4" />
        </video>
      </View>

      {/* Form layer — keyboard aware, scrollable so fields stay visible */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {currentScreen === 'Login' ? (
            <LoginScreen navigation={mockNavigation} videoFinished={videoFinished} />
          ) : (
            <SignupScreen navigation={mockNavigation} videoFinished={videoFinished} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

export default AuthScreen;
