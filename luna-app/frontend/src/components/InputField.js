import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const InputField = ({ label, error, secureTextEntry, icon, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setFocused(true);
    focusAnim.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    if (props.onFocus) props.onFocus();
  };

  const handleBlur = () => {
    setFocused(false);
    focusAnim.value = withTiming(0, { duration: 250 });
    if (props.onBlur) props.onBlur();
  };

  const wrapperStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? 'rgba(231,76,60,0.7)'
      : `rgba(220,20,60,${interpolate(focusAnim.value, [0, 1], [0.18, 0.6])})`,
    backgroundColor: `rgba(220,20,60,${interpolate(focusAnim.value, [0, 1], [0.04, 0.1])})`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: focusAnim.value * 0.6,
    shadowOpacity: focusAnim.value * 0.4,
  }));

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, wrapperStyle]} pointerEvents="box-none">
        {/* Focus glow */}
        <Animated.View style={[styles.focusGlow, glowStyle]} pointerEvents="none" />

        {icon && (
          <Ionicons
            name={icon}
            size={17}
            color={focused ? colors.crimson : 'rgba(255,255,255,0.25)'}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.2)"
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={17}
              color="rgba(255,255,255,0.25)"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={12} color="#FF6B6B" />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    ...typography.label,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  focusGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 0,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 13,
    letterSpacing: 0.2,
  },
  eyeBtn: { padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  error: { color: '#FF6B6B', fontSize: 11, letterSpacing: 0.2 },
});

export default InputField;
