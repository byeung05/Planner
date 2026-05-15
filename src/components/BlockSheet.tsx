import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Block } from '../types';
import { Dark, DomainDark } from '../colors';
import { formatTime, formatDuration } from '../utils/time';
import { useBlockStore } from '../store/useBlockStore';

const SHEET_HEIGHT = 520;
const DISMISS_THRESHOLD = 80;

interface Props {
  block: Block | null;
  onClose: () => void;
}

function StepButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.stepBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.stepBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function BlockSheet({ block, onClose }: Props) {
  const updateBlock = useBlockStore((s) => s.updateBlock);
  const removeBlock = useBlockStore((s) => s.removeBlock);
  const completeBlock = useBlockStore((s) => s.completeBlock);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [startHour, setStartHour] = useState(8);
  const [startMin, setStartMin] = useState(0);
  const [durationMin, setDurationMin] = useState(60);
  const [dirty, setDirty] = useState(false);

  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isVisible = block !== null;

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setNote(block.note ?? '');
      setStartHour(block.startHour);
      setStartMin(block.startMin);
      setDurationMin(block.durationMin);
      setDirty(false);
      translateY.value = withSpring(0, { damping: 26, stiffness: 280 });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 26, stiffness: 280 });
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [block]);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, dragStartY.value + e.translationY);
      backdropOpacity.value = interpolate(
        translateY.value,
        [0, SHEET_HEIGHT],
        [1, 0],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((e) => {
      if (translateY.value > DISMISS_THRESHOLD || e.velocityY > 600) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 26, stiffness: 280 });
        backdropOpacity.value = withTiming(1, { duration: 150 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  if (!block) return null;

  const isCompleted = Boolean(block.completedAt);

  function adjustStart(deltaMin: number) {
    const raw = startHour * 60 + startMin + deltaMin;
    const clamped = Math.max(0, Math.min(23 * 60, raw));
    setStartHour(Math.floor(clamped / 60));
    setStartMin(clamped % 60);
    setDirty(true);
  }

  function adjustDuration(delta: number) {
    setDurationMin((d) => Math.max(15, Math.min(480, d + delta)));
    setDirty(true);
  }

  function handleSave() {
    if (!title.trim()) return;
    updateBlock(block.id, {
      title: title.trim(),
      note: note.trim() || undefined,
      startHour,
      startMin,
      durationMin,
    });
    dismiss();
  }

  function handleDelete() {
    Alert.alert('Delete block', `Remove "${block.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeBlock(block.id);
          dismiss();
        },
      },
    ]);
  }

  function handleComplete() {
    completeBlock(block.id);
    dismiss();
  }

  const endHour = Math.floor((startHour * 60 + startMin + durationMin) / 60);
  const endMin = (startHour * 60 + startMin + durationMin) % 60;

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header row */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>{block.icon}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerDomain}>
                {block.domain === 'study' ? 'Study' : block.domain === 'sleep' ? 'Rest' : 'Scheduled'}
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1}>{block.title}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={dismiss} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Time row */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Start time</Text>
              <View style={styles.stepRow}>
                <StepButton label="−15m" onPress={() => adjustStart(-15)} />
                <StepButton label="−5m" onPress={() => adjustStart(-5)} />
                <View style={styles.stepValue}>
                  <Text style={styles.stepValueText}>{formatTime(startHour, startMin)}</Text>
                </View>
                <StepButton label="+5m" onPress={() => adjustStart(5)} />
                <StepButton label="+15m" onPress={() => adjustStart(15)} />
              </View>
            </View>

            {/* Duration row */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <View style={styles.stepRow}>
                <StepButton label="−30m" onPress={() => adjustDuration(-30)} />
                <StepButton label="−15m" onPress={() => adjustDuration(-15)} />
                <View style={styles.stepValue}>
                  <Text style={styles.stepValueText}>{formatDuration(durationMin)}</Text>
                </View>
                <StepButton label="+15m" onPress={() => adjustDuration(15)} />
                <StepButton label="+30m" onPress={() => adjustDuration(30)} />
              </View>
              <Text style={styles.endTimeHint}>
                Ends at {formatTime(endHour, endMin)}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Title edit */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(t) => { setTitle(t); setDirty(true); }}
                placeholderTextColor={Dark.sub}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Note edit */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Note</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Add a note…"
                placeholderTextColor={Dark.sub}
                value={note}
                onChangeText={(t) => { setNote(t); setDirty(true); }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actionRow}>
              {!isCompleted && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.completeBtn]}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completeBtnText}>✓  Mark complete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Save bar */}
          {dirty && (
            <View style={styles.saveBar}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Save changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 800,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 900,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Dark.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Dark.border,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { fontSize: 20 },
  headerMeta: { flex: 1 },
  headerDomain: {
    fontSize: 11,
    fontWeight: '600',
    color: Dark.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Dark.text,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: Dark.sub,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 4 },
  section: { paddingVertical: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Dark.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: Dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Dark.border,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Dark.subLight,
  },
  stepValue: {
    flex: 1.4,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,96,76,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,96,76,0.25)',
  },
  stepValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: Dark.accent,
  },
  endTimeHint: {
    fontSize: 11,
    color: Dark.sub,
    marginTop: 6,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Dark.border,
    marginVertical: 4,
  },
  input: {
    backgroundColor: Dark.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Dark.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Dark.text,
  },
  noteInput: {
    height: 80,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: {
    backgroundColor: 'rgba(232,96,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,96,76,0.3)',
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Dark.accent,
  },
  deleteBtn: {
    backgroundColor: 'rgba(200,50,50,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(200,50,50,0.25)',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E05555',
  },
  saveBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Dark.border,
    backgroundColor: Dark.surface,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Dark.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
