import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width: W } = Dimensions.get('window');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const pad = (n) => String(n).padStart(2, '0');

// blockedMonths: array of { month: 0-11, year: number }
const DatePicker = ({ label, value, onChange, placeholder = 'Select date', blockedMonths = [] }) => {
  const [open, setOpen] = useState(false);
  const [blockMsg, setBlockMsg] = useState('');

  const parseValue = () => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return { year: y, month: m - 1, day: d };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  };

  const [selected, setSelected] = useState(parseValue);
  const [view, setView] = useState('day');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const days = Array.from({ length: getDaysInMonth(selected.month, selected.year) }, (_, i) => i + 1);

  const isBlocked = (month, year) =>
    blockedMonths.some((b) => b.month === month && b.year === year);

  const confirm = () => {
    if (isBlocked(selected.month, selected.year)) {
      setBlockMsg(
        `${MONTHS[selected.month]} ${selected.year} is already in your history.\nSelect a different month/year or delete it from History.`
      );
      return;
    }
    setBlockMsg('');
    const dateStr = `${selected.year}-${pad(selected.month + 1)}-${pad(selected.day)}`;
    onChange(dateStr);
    setOpen(false);
    setView('day');
  };

  const clear = () => {
    onChange('');
    setOpen(false);
    setView('day');
    setBlockMsg('');
  };

  const displayValue = value
    ? `${MONTHS[parseInt(value.split('-')[1]) - 1]} ${parseInt(value.split('-')[2])}, ${value.split('-')[0]}`
    : placeholder;

  return (
    <>
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity style={styles.trigger} onPress={() => { setBlockMsg(''); setOpen(true); }} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={16} color={value ? colors.crimson : 'rgba(255,255,255,0.3)'} />
          <Text style={[styles.triggerText, value && styles.triggerTextActive]}>{displayValue}</Text>
          {value && (
            <TouchableOpacity onPress={clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <LinearGradient colors={['rgba(20,0,4,0.98)', 'rgba(10,0,2,0.99)']} style={styles.modal}>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Select Date'}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {/* Block message */}
              {blockMsg ? (
                <View style={styles.blockBanner}>
                  <Ionicons name="warning-outline" size={16} color="#FFD700" />
                  <Text style={styles.blockText}>{blockMsg}</Text>
                </View>
              ) : null}

              {/* Selection chips */}
              <View style={styles.selectionRow}>
                <TouchableOpacity style={[styles.selChip, view === 'day' && styles.selChipActive]} onPress={() => setView('day')}>
                  <Text style={[styles.selChipText, view === 'day' && styles.selChipTextActive]}>{pad(selected.day)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selChip, view === 'month' && styles.selChipActive]} onPress={() => setView('month')}>
                  <Text style={[styles.selChipText, view === 'month' && styles.selChipTextActive]}>{MONTHS[selected.month]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selChip, view === 'year' && styles.selChipActive]} onPress={() => setView('year')}>
                  <Text style={[styles.selChipText, view === 'year' && styles.selChipTextActive]}>{selected.year}</Text>
                </TouchableOpacity>
              </View>

              {/* Grid */}
              <View style={styles.grid}>
                {view === 'day' && (
                  <View style={styles.dayGrid}>
                    {days.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.cell, selected.day === d && styles.cellActive]}
                        onPress={() => { setSelected((s) => ({ ...s, day: d })); setBlockMsg(''); }}
                      >
                        <Text style={[styles.cellText, selected.day === d && styles.cellTextActive]}>{pad(d)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {view === 'month' && (
                  <View style={styles.monthGrid}>
                    {MONTHS.map((m, i) => {
                      const blocked = isBlocked(i, selected.year);
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.monthCell,
                            selected.month === i && styles.cellActive,
                            blocked && styles.monthCellBlocked,
                          ]}
                          onPress={() => {
                            if (blocked) {
                              setBlockMsg(
                                `${m} ${selected.year} is already in your history.\nSelect a different month/year or delete it from History.`
                              );
                              return;
                            }
                            setBlockMsg('');
                            const maxDay = getDaysInMonth(i, selected.year);
                            setSelected((s) => ({ ...s, month: i, day: Math.min(s.day, maxDay) }));
                            setView('day');
                          }}
                        >
                          <Text style={[
                            styles.cellText,
                            selected.month === i && styles.cellTextActive,
                            blocked && styles.monthCellBlockedText,
                          ]}>
                            {m}
                          </Text>
                          {blocked && <Text style={styles.blockedDot}>●</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {view === 'year' && (
                  <View style={styles.monthGrid}>
                    {years.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[styles.monthCell, selected.year === y && styles.cellActive]}
                        onPress={() => {
                          setBlockMsg('');
                          const maxDay = getDaysInMonth(selected.month, y);
                          setSelected((s) => ({ ...s, year: y, day: Math.min(s.day, maxDay) }));
                          setView('month');
                        }}
                      >
                        <Text style={[styles.cellText, selected.year === y && styles.cellTextActive]}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Confirm */}
              <TouchableOpacity onPress={confirm} activeOpacity={0.85}>
                <LinearGradient colors={['#FF2D55', '#8B0000']} style={styles.confirmBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.confirmText}>Confirm Date</Text>
                </LinearGradient>
              </TouchableOpacity>

            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(220,20,60,0.06)',
    borderWidth: 1, borderColor: 'rgba(220,20,60,0.2)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  triggerText: { flex: 1, color: 'rgba(255,255,255,0.3)', fontSize: 14 },
  triggerTextActive: { color: '#fff' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: W * 0.88, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(220,20,60,0.2)' },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  blockBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(114,47,55,0.9)', borderRadius: 12,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#FFD700',
  },
  blockText: { flex: 1, color: '#FFD700', fontSize: 13, fontWeight: '600', lineHeight: 18 },

  selectionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  selChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(220,20,60,0.2)', alignItems: 'center', backgroundColor: 'rgba(220,20,60,0.05)' },
  selChipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  selChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
  selChipTextActive: { color: '#fff' },

  grid: { marginBottom: 16 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: (W * 0.88 - 40 - 6 * 6) / 7, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  cellActive: { backgroundColor: colors.crimson },
  cellText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  cellTextActive: { color: '#fff', fontWeight: '700' },

  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell: { width: (W * 0.88 - 40 - 8 * 3) / 4, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  monthCellBlocked: { backgroundColor: 'rgba(114,47,55,0.5)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' },
  monthCellBlockedText: { color: 'rgba(255,255,255,0.3)' },
  blockedDot: { color: '#FFD700', fontSize: 6, marginTop: 2 },

  confirmBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default DatePicker;
