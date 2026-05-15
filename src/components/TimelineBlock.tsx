import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Block } from '../types';
import { Dark, DomainDark } from '../colors';
import { formatTime, snapToQuarter } from '../utils/time';
import { useBlockStore } from '../store/useBlockStore';

export const HOUR_HEIGHT = 60;
export const START_HOUR = 6;
const SPINE_X = 52;
const ICON_SIZE = 44;

interface Props {
  block: Block;
  onPress: (block: Block) => void;
  isTimerActive?: boolean;
}

function minsToTime(totalMin: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMin));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hd = h % 12 === 0 ? 12 : h % 12;
  return `${hd}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function TimelineBlock({ block, onPress, isTimerActive = false }: Props) {
  const moveBlock = useBlockStore((s) => s.moveBlock);
  const domainColor = DomainDark[block.domain];

  const offsetMin = block.startHour * 60 + block.startMin - START_HOUR * 60;
  const baseTop = (offsetMin / 60) * HOUR_HEIGHT;
  const height = Math.max((block.durationMin / 60) * HOUR_HEIGHT, 56);

  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const startY = useSharedValue(0);

  const [dragLabel, setDragLabel] = useState<string | null>(null);

  const updateDragLabel = useCallback((dy: number) => {
    const deltaMin = snapToQuarter(Math.round((dy / HOUR_HEIGHT) * 60));
    const newMin = block.startHour * 60 + block.startMin + deltaMin;
    setDragLabel(minsToTime(newMin));
  }, [block.startHour, block.startMin]);

  const clearDragLabel = useCallback(() => setDragLabel(null), []);

  const onSnap = useCallback((dy: number) => {
    const deltaMin = snapToQuarter(Math.round((dy / HOUR_HEIGHT) * 60));
    const raw = block.startHour * 60 + block.startMin + deltaMin;
    const newMin = Math.max(0, Math.min(23 * 60, raw));
    moveBlock(block.id, Math.floor(newMin / 60), newMin % 60);
  }, [block.id, block.startHour, block.startMin, moveBlock]);

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      translateY.value = startY.value + e.translationY;
      runOnJS(updateDragLabel)(translateY.value);
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(onSnap)(translateY.value);
      translateY.value = withSpring(0, { damping: 24, stiffness: 300 });
      runOnJS(clearDragLabel)();
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 300 : 10,
    shadowOpacity: isDragging.value ? 0.5 : 0.15,
    shadowRadius: isDragging.value ? 16 : 4,
    elevation: isDragging.value ? 12 : 2,
  }));

  const isCompleted = Boolean(block.completedAt);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrapper, { top: baseTop, height }, animStyle]}>
        {/* Drag time badge */}
        {dragLabel !== null && (
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{dragLabel}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.block,
            { height },
            isTimerActive && styles.blockActive,
            isCompleted && styles.blockDone,
          ]}
          onPress={() => onPress(block)}
          activeOpacity={0.85}
        >
          {/* Icon pill */}
          <View style={[styles.iconPill, { backgroundColor: Dark.bg, height: height - 12 }]}>
            <Text style={styles.iconText}>{block.icon}</Text>
          </View>

          {/* Text */}
          <View style={styles.textArea}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {block.domain === 'study' ? 'Study session' : block.domain === 'sleep' ? 'Rest' : 'Scheduled'}
            </Text>
            <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={2}>
              {block.title}
            </Text>
            {height > 72 && (
              <Text style={styles.timeMeta}>
                {formatTime(block.startHour, block.startMin)}
                {'  ·  '}
                {block.durationMin < 60
                  ? `${block.durationMin}m`
                  : block.durationMin % 60 === 0
                  ? `${block.durationMin / 60}h`
                  : `${Math.floor(block.durationMin / 60)}h ${block.durationMin % 60}m`}
              </Text>
            )}
          </View>

          {/* Completion circle */}
          <TouchableOpacity
            style={[styles.completionCircle, isCompleted && styles.completionDone]}
            onPress={() => {
              if (!isCompleted) useBlockStore.getState().completeBlock(block.id);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {isCompleted && <Text style={styles.checkText}>✓</Text>}
          </TouchableOpacity>

          {/* Active timer pulse */}
          {isTimerActive && <View style={styles.timerDot} />}
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPINE_X - ICON_SIZE / 2,
    right: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  },
  timeBadge: {
    position: 'absolute',
    top: -26,
    left: ICON_SIZE / 2,
    backgroundColor: Dark.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 400,
  },
  timeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Dark.block,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 10,
    overflow: 'hidden',
  },
  blockActive: {
    borderWidth: 1.5,
    borderColor: Dark.accent,
  },
  blockDone: {
    opacity: 0.5,
  },
  iconPill: {
    width: ICON_SIZE,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 18,
  },
  textArea: {
    flex: 1,
    gap: 1,
  },
  subtitle: {
    fontSize: 11,
    color: Dark.sub,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Dark.text,
    lineHeight: 20,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Dark.sub,
  },
  timeMeta: {
    fontSize: 11,
    color: Dark.subLight,
    marginTop: 2,
  },
  completionCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  completionDone: {
    backgroundColor: Dark.accent,
    borderColor: Dark.accent,
  },
  checkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  timerDot: {
    position: 'absolute',
    top: 10,
    right: 46,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Dark.accent,
  },
});
