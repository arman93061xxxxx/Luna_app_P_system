import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

const LoginScreen = ({ navigation, videoFinished }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuthStore();

  const formOpacity = useSharedValue(videoFinished ? 1 : 0);
  React.useEffect(() => {
    if (videoFinished) formOpacity.value = withTiming(1, { duration: 1000 });
  }, [videoFinished]);
  const formStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value }));

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const result = await login(email.trim().toLowerCase(), password);
    if (!result.success) setErrors({ general: result.message });
  };

  if (!videoFinished) return null;

  return (
    <Animated.View style={[styles.formContainer, formStyle]}>
      <View style={styles.centerCircle}>
        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
          <Text style={styles.forgotButtonText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupButton}>
          <Text style={styles.signupLink}>
            New here? <Text style={styles.signupAccent}>Create account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', paddingTop: 60,
  },
  centerCircle: {
    width: '100%', maxWidth: 320,
    paddingVertical: 30, paddingHorizontal: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  inputGroup: { width: '100%', marginBottom: 20 },
  label: {
    color: '#FFFFFF', fontSize: 11, fontWeight: '600',
    letterSpacing: 1.2, marginBottom: 8, textTransform: 'uppercase',
  },
  input: {
    width: '100%', color: '#FFFFFF', fontSize: 15,
    paddingVertical: 10, paddingHorizontal: 0,
    borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
  },
  errorText: { color: '#FFD700', fontSize: 11, marginTop: 6, marginBottom: 6, textAlign: 'center' },
  signInButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25, paddingVertical: 13, alignItems: 'center',
    marginTop: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  signInButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.8 },
  forgotButton: { marginTop: 14, alignItems: 'center' },
  forgotButtonText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  signupButton: { marginTop: 20 },
  signupLink: { color: '#FFFFFF', textAlign: 'center', fontSize: 13 },
  signupAccent: { color: '#FFD700', fontWeight: '700', textDecorationLine: 'underline' },
});

export default LoginScreen;
