import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from '../screens/AuthScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AIInsightsScreen from '../screens/AIInsightsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddLogScreen from '../screens/AddLogScreen';

import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { ms, rf, isTablet } from '../utils/responsive';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, color }) => {
  const scale = useSharedValue(focused ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.9, { damping: 18 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={tabIconStyles.wrap}>
      {focused && <View style={tabIconStyles.glow} />}
      <Animated.View style={iconStyle}>
        <Ionicons name={name} size={22} color={color} />
      </Animated.View>
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  wrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(220,20,60,0.15)',
  },
});

const TAB_CONFIG = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Calendar:  { active: 'calendar', inactive: 'calendar-outline' },
  History:   { active: 'list', inactive: 'list-outline' },
  Insights:  { active: 'sparkles', inactive: 'sparkles-outline' },
  Profile:   { active: 'person', inactive: 'person-outline' },
};

// ─── Main tab navigator ───────────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: 'rgba(255,180,180,0.6)',
      tabBarShowLabel: true,
      tabBarLabelStyle: styles.tabLabel,
      tabBarBackground: () => (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.tabBarBg} />
        </View>
      ),
      tabBarIcon: ({ focused, color }) => {
        const cfg = TAB_CONFIG[route.name];
        return (
          <TabIcon
            name={focused ? cfg.active : cfg.inactive}
            focused={focused}
            color={color}
          />
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Insights" component={AIInsightsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Root navigator ───────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  console.log('AppNavigator render - isAuthenticated:', isAuthenticated, 'user:', user?.email);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="AddLog"
              component={AddLogScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: isTablet ? 90 : ms(72),
    paddingTop: ms(6),
    paddingBottom: ms(14),
    backgroundColor: 'transparent',
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: '#722F37',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,150,150,0.3)',
  },
  tabLabel: {
    fontSize: rf(10),
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});

export default AppNavigator;
