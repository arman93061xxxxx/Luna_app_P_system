import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, Easing, interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../services/api';
import VideoBackground from '../components/VideoBackground';
import { colors } from '../theme/colors';

const { width: W } = Dimensions.get('window');

// AI orb — pure RN, no Skia
const AIOrb = ({ size = 40, isTyping = false }) => {
  const pulse = useSharedValue(1);
  const innerPulse = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: isTyping ? 400 : 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: isTyping ? 400 : 2000, easing: Easing.inOut(Easing.sine) })
      ),
      -1, false
    );
    innerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.sine) })
      ),
      -1, false
    );
  }, [isTyping]);

  const outerStyle = useAnimatedStyle(() => ({
    width: size * pulse.value,
    height: size * pulse.value,
    borderRadius: (size * pulse.value) / 2,
    backgroundColor: 'rgba(139,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(pulse.value, [1, 1.15], [0.4, 0.8]),
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220,20,60,0.5)',
  }));

  return (
    <Animated.View style={outerStyle}>
      <Text style={{ fontSize: size * 0.4 }}>🌙</Text>
    </Animated.View>
  );
};

// ─── Typing dots ──────────────────────────────────────────────────────────────
const SingleDot = ({ value, index }) => {
  const style = useAnimatedStyle(() => ({
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.crimson,
    marginHorizontal: 2,
    transform: [{ translateY: interpolate(value.value, [0, 1], [0, -5]) }],
    opacity: interpolate(value.value, [0, 1], [0.4, 1]),
  }));
  return <Animated.View style={style} />;
};

const TypingDots = () => {
  const dot0 = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);

  useEffect(() => {
    [dot0, dot1, dot2].forEach((d, i) => {
      d.value = withDelay(
        i * 200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
          ),
          -1, false
        )
      );
    });
  }, []);

  return (
    <View style={styles.typingDots}>
      <SingleDot value={dot0} index={0} />
      <SingleDot value={dot1} index={1} />
      <SingleDot value={dot2} index={2} />
    </View>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, index }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(msg.role === 'user' ? 20 : -20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateX.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const isUser = msg.role === 'user';

  return (
    <Animated.View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow, style]}>
      {!isUser && <AIOrb size={36} />}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <LinearGradient
            colors={['rgba(180,0,20,0.9)', 'rgba(100,0,10,0.95)']}
            style={styles.bubbleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.userText}>{msg.content}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.aiBubbleInner}>
            <Text style={styles.aiText}>{msg.content}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Suggestion chip ──────────────────────────────────────────────────────────
const SuggestionChip = ({ text, onPress }) => {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.95, { duration: 80 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 80 }); }}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['rgba(220,20,60,0.12)', 'rgba(100,0,15,0.08)']}
          style={styles.chip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.chipText}>{text}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SUGGESTIONS = [
  'Why is my period late?',
  'How to reduce cramps?',
  'What foods help during my period?',
  'Why am I feeling so tired?',
  'When is my fertile window?',
];

// ─── Main screen ──────────────────────────────────────────────────────────────
const AIChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I'm Luna — your personal cycle health assistant. Ask me anything about your menstrual health, symptoms, or cycle patterns." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat(msg, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages, loading]);

  return (
    <View style={styles.container}>
      <VideoBackground />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.crimson} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <AIOrb size={32} isTyping={loading} />
          <View>
            <Text style={styles.headerTitle}>Luna AI</Text>
            <Text style={styles.headerStatus}>{loading ? 'thinking...' : 'online'}</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => <MessageBubble msg={item} index={index} />}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={
            loading ? (
              <View style={[styles.msgRow, styles.aiRow]}>
                <AIOrb size={36} isTyping />
                <View style={[styles.bubble, styles.aiBubble]}>
                  <View style={styles.aiBubbleInner}>
                    <TypingDots />
                  </View>
                </View>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Suggestions */}
        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <SuggestionChip key={s} text={s} onPress={() => sendMessage(s)} />
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <LinearGradient
            colors={['rgba(20,0,4,0.95)', 'rgba(10,0,2,0.98)']}
            style={styles.inputBarGradient}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask Luna anything..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={input.trim() && !loading ? ['#FF2D55', '#8B0000'] : ['#2a0008', '#1a0005']}
                  style={styles.sendBtnGradient}
                >
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 58, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(180,0,30,0.2)',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#2D0010', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  headerStatus: { color: '#C2185B', fontSize: 11, letterSpacing: 0.5, fontWeight: '600' },
  messageList: { padding: 16, paddingBottom: 12 },
  msgRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: 8 },
  bubble: { maxWidth: '76%' },
  userBubble: { borderRadius: 20, borderBottomRightRadius: 5, overflow: 'hidden' },
  aiBubble: { borderRadius: 20, borderBottomLeftRadius: 5, overflow: 'hidden' },
  bubbleGradient: { paddingHorizontal: 14, paddingVertical: 10 },
  aiBubbleInner: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)',
    borderRadius: 20, borderBottomLeftRadius: 5, backgroundColor: '#722F37',
  },
  userText: { color: '#fff', fontSize: 14, lineHeight: 21 },
  aiText: { color: '#FFFFFF', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  typingDots: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  suggestions: { paddingHorizontal: 14, paddingBottom: 6, gap: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,150,150,0.3)', marginBottom: 4,
    backgroundColor: '#722F37',
  },
  chipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  inputBar: { borderTopWidth: 1, borderTopColor: 'rgba(180,0,30,0.15)' },
  inputBarGradient: { paddingHorizontal: 14, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 10 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(255,150,150,0.4)',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFFFFF', fontSize: 14, maxHeight: 100, backgroundColor: '#722F37',
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendBtnOff: { opacity: 0.4 },
  sendBtnGradient: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});

export default AIChatScreen;
