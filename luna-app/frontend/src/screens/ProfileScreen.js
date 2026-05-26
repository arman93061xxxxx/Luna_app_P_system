import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import InputField from '../components/InputField';
import CrimsonButton from '../components/CrimsonButton';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      {icon && <Ionicons name={icon} size={14} color="rgba(255,255,255,0.25)" />}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    averageCycleLength: user?.averageCycleLength?.toString() || '28',
  });
  const [notifications, setNotifications] = useState(
    user?.notificationPreferences || { periodReminder: true, ovulationReminder: true, fertileWindowReminder: true }
  );
  const [saving, setSaving] = useState(false);

  const contentOpacity = useSharedValue(0);
  React.useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500 });
  }, []);
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        averageCycleLength: Number(form.averageCycleLength) || 28,
        notificationPreferences: notifications,
      });
      updateUser(res.data.user);
      setEditing(false);
      
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Failed to update profile');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'L';

  return (
    <View style={styles.container}>
      <VideoBackground />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={contentStyle}>
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#DC143C', '#8B0000', '#4A0010']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="moon" size={11} color="#000000" />
              <Text style={styles.memberText}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </Text>
            </View>
          </View>

          {/* Profile card */}
          <LinearGradient
            colors={['#722F37', '#5C2530']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profile</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editBtn}>
                <Ionicons name={editing ? 'close' : 'pencil-outline'} size={16} color={colors.crimson} />
                <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                <InputField label="Name" value={form.name} onChangeText={set('name')} icon="person-outline" />
                <InputField label="Age" value={form.age} onChangeText={set('age')} keyboardType="numeric" icon="calendar-outline" />
                <InputField label="Avg Cycle Length (days)" value={form.averageCycleLength} onChangeText={set('averageCycleLength')} keyboardType="numeric" icon="sync-outline" />
                <CrimsonButton title="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: 4 }} />
              </>
            ) : (
              <>
                <InfoRow label="Name" value={user?.name} icon="person-outline" />
                <InfoRow label="Age" value={user?.age ? `${user.age} years` : undefined} icon="calendar-outline" />
                <InfoRow label="Avg Cycle" value={`${user?.averageCycleLength || 28} days`} icon="sync-outline" />
              </>
            )}
          </LinearGradient>

          {/* Notifications */}
          <LinearGradient
            colors={['#722F37', '#5C2530']}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Notifications</Text>
            {[
              { key: 'periodReminder', label: 'Period Reminder', icon: 'notifications-outline' },
              { key: 'ovulationReminder', label: 'Ovulation Reminder', icon: 'flower-outline' },
              { key: 'fertileWindowReminder', label: 'Fertile Window', icon: 'heart-outline' },
            ].map((item) => (
              <View key={item.key} style={styles.notifRow}>
                <View style={styles.notifLeft}>
                  <Ionicons name={item.icon} size={15} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.notifLabel}>{item.label}</Text>
                </View>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={(val) => setNotifications((n) => ({ ...n, [item.key]: val }))}
                  trackColor={{ false: 'rgba(255,255,255,0.08)', true: 'rgba(139,0,0,0.6)' }}
                  thumbColor={notifications[item.key] ? colors.crimson : 'rgba(255,255,255,0.3)'}
                  ios_backgroundColor="rgba(255,255,255,0.08)"
                />
              </View>
            ))}
          </LinearGradient>

          <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn} activeOpacity={0.85}>
            <Text style={styles.signOutText}>⏻  Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  userName: { color: '#000000', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  userEmail: { color: '#000000', fontSize: 13, marginTop: 3, fontWeight: '500' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', backgroundColor: 'rgba(0,0,0,0.06)' },
  memberText: { color: '#000000', fontSize: 11, fontWeight: '700' },
  card: { borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,150,150,0.3)', backgroundColor: '#722F37' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { color: '#FFB3C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,150,150,0.2)' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { color: '#FFB3C1', fontSize: 14, fontWeight: '500' },
  infoValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  notifLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  signOutBtn: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  signOutText: { color: '#000000', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});

export default ProfileScreen;
