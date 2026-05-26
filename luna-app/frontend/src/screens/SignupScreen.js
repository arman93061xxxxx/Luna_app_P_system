import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

const SignupScreen = ({ navigation, videoFinished }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', averageCycleLength: '28',
  });
  const [errors, setErrors] = useState({});
  const { signup, isLoading } = useAuthStore();

  const formOpacity = useSharedValue(videoFinished ? 1 : 0);
  React.useEffect(() => {
    if (videoFinished) formOpacity.value = withTiming(1, { duration: 1000 });
  }, [videoFinished]);
  const formStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value }));

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Min. 6 chars';
    if (form.age && (isNaN(form.age) || form.age < 10 || form.age > 60)) e.age = 'Invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    const result = await signup({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      age: form.age ? parseInt(form.age) : undefined,
      averageCycleLength: parseInt(form.averageCycleLength) || 28,
    });
    if (!result.success) setErrors({ general: result.message });
  };

  if (!videoFinished) return null;

  return (
    <Animated.View style={[styles.formContainer, formStyle]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.centerCircle}>
          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

          {/* 2-column grid */}
          <View style={styles.grid}>
            {/* LEFT */}
            <View style={styles.col}>
              <View style={styles.field}>
                <Text style={styles.label}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={form.name}
                  onChangeText={set('name')}
                  autoCapitalize="words"
                />
                {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>
            </View>

            {/* RIGHT */}
            <View style={styles.col}>
              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 chars"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry
                />
                {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="25"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={form.age}
                    onChangeText={set('age')}
                    keyboardType="numeric"
                  />
                  {errors.age && <Text style={styles.fieldError}>{errors.age}</Text>}
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>CYCLE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="28"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={form.averageCycleLength}
                    onChangeText={set('averageCycleLength')}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleSignup} disabled={isLoading} style={styles.signupButton}>
            <Text style={styles.signupButtonText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
            <Text style={styles.loginLink}>
              Have an account? <Text style={styles.loginAccent}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', paddingTop: 80,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  centerCircle: { width: '100%', maxWidth: 380, paddingHorizontal: 24, alignItems: 'center' },
  grid: { flexDirection: 'row', width: '100%', gap: 20, marginBottom: 4 },
  col: { flex: 1 },
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', marginBottom: 14 },
  label: {
    color: '#FFFFFF', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase',
  },
  input: {
    color: '#FFFFFF', fontSize: 13,
    paddingVertical: 8, paddingHorizontal: 0,
    borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
  },
  fieldError: { color: '#FFD700', fontSize: 10, marginTop: 3 },
  errorText: { color: '#FFD700', fontSize: 11, marginBottom: 10, textAlign: 'center' },
  signupButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25, paddingVertical: 11, alignItems: 'center',
    marginTop: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  signupButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.8 },
  loginButton: { marginTop: 14 },
  loginLink: { color: '#FFFFFF', textAlign: 'center', fontSize: 12 },
  loginAccent: { color: '#FFD700', fontWeight: '700', textDecorationLine: 'underline' },
});

export default SignupScreen;
