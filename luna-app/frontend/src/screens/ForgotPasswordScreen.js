import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput,
} from 'react-native';
import { authAPI } from '../services/api';
import VideoBackground from '../components/VideoBackground';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authAPI.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
      
      if (Platform.OS === 'web') {
        alert('Password reset instructions sent to your email!');
      } else {
        Alert.alert('Success', 'Password reset instructions sent to your email!');
      }
      
      setTimeout(() => navigation.goBack(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackground />
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && <Text style={styles.successText}>Email sent successfully!</Text>}

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
              editable={!isLoading && !success}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || success}
            style={[styles.submitButton, (isLoading || success) && styles.disabledButton]}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Sending...' : success ? 'Sent!' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%', maxWidth: 450, padding: 32, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(180,0,30,0.25)',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#2D0010', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#5D1020', fontSize: 14, marginBottom: 32, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  inputGroup: { width: '100%', marginBottom: 24 },
  label: { color: '#7D2035', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  errorText: { color: '#C2185B', fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: '600' },
  successText: { color: '#2E7D32', fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: '600' },
  submitButton: { width: '100%', backgroundColor: '#FF1744', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#5D1020', fontSize: 15, fontWeight: '600' },
});

export default ForgotPasswordScreen;
