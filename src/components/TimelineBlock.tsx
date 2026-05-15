import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Block } from '../types';
import { Dark } from '../colors';
import { formatTime, snapToQuarter, currentTimeMinutes } from '../utils/time';
import { useBlockStore } from '../store/useBlockStore';

export const HOUR_HEIGHT = 60;
export const START_HOUR = 6;
export const SPINE_X = 52;

const DOMAIN_ACCENT: Record<string, string> = {
  sleep:    '#9B8FE0',
  study:    '#E8604C',
  schedule: '#F5A623',
};
const DOMAIN_FILL: Record<string, string> = {
  sleep:    'rgba(155,143,224,0.20)',
  study:    'rgba(232,96,76,0.18)',
  schedule: 'rgba(245,166,35,0.18)',
};

function minsToTimeLabel(totalMin: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMin));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hd = h % 12 === 0 ? 12 : h % 12;
  return `${hd}:${String(m).padStart(2, '0')} ${ampm}`;
}

interface Props {
  block: Block;
  onPress: (block: Block) => void;
  isTimerActive?: boolean;
}

export function TimelineBlock({ block, onPress, isTimerActive = false }: Props) {
  const moveBlock = useBlockStore((s) => s.moveBlock);
  const { width: screenWidth } = useWindowDimensions();

  const LEFT_OFFSET = SPINE_X + 10;
  const RIGHT_MARGIN = Math.max(10, Math.round(screenWidth * 0.03));

  const offsetMin = block.startHour * 60 + block.startMin - START_HOUR * 60;
  const baseTop = (offsetMin / 60) * HOUR_HEIGHT;
  const height = Math.max((block.durationMin / 60) * HOUR_HEIGHT, 52);

  // Progressive fill: 0 = future, 0–1 = in-progress, 1 = past
  const nowMin = currentTimeMinutes();
  const blockStartMin = block.startHour * 60 + block.startMin;
  const blockEndMin = blockStartMin + block.durationMin;
  const rawFill = (nowMin - blockStartMin) / block.durationMin;
  const fillPct = Math.max(0, Math.min(1, rawFill));
  const isPast = fillPct >= 1;
  const isCurrent = fillPct > 0 && fillPct < 1;

  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const startY = useSharedValue(0);
  const didDrag = useSharedValue(false);

  const [dragLabel, setDragLabel] = useState<string | null>(null);

  const updateDragLabel = useCallback((dy: number) => {
    const deltaMin = snapToQuarter(Math.round((dy / HOUR_HEIGHT) * 60));
    const newMin = block.startHour * 60 + block.startMin + deltaMin;
    setDragLabel(minsToTimeLabel(newMin));
  }, [block.startHour, block.startMin]);

  const clearDragLabel = useCallback(() => setDragLabel(null), []);

  const onSnap = useCallback((dy: number) => {
    const deltaMin = snapToQuarter(Math.round((dy / HOUR_HEIGHT) * 60));
    const raw = block.startHour * 60 + block.startMin + deltaMin;
    const newMin = Math.max(0, Math.min(23 * 60, raw));
    moveBlock(block.id, Math.floor(newMin / 60), newMin % 60);
  }, [block.id, block.startHour, block.startMin, moveBlock]);

  const handlePress = useCallback(() => {
    // Prevent the touch-up after a drag from opening the sheet
    if (!didDrag.value) {
      onPress(block);
    }
    didDrag.value = false;
  }, [block, onPress]);

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      startY.value = translateY.value;
      isDragging.value = true;
      didDrag.value = false;
    })
    .onUpdate((e) => {
      didDrag.value = true;
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
    shadowOpacity: isDragging.value ? 0.5 : isPast ? 0.05 : 0.15,
    shadowRadius: isDragging.value ? 16 : 5,
    elevation: isDragging.value ? 12 : isPast ? 1 : 3,
  }));

  const isCompleted = Boolean(block.completedAt);
  const accent = DOMAIN_ACCENT[block.domain] ?? Dark.accent;
  const fillColor = DOMAIN_FILL[block.domain] ?? 'rgba(232,96,76,0.18)';

  const endH = Math.floor(blockEndMin / 60);
  const endM = blockEndMin % 60;

  const durationStr = block.durationMin < 60
    ? `${block.durationMin}m`
    : block.durationMin % 60 === 0
    ? `${block.durationMin / 60}h`
    : `${Math.floor(block.durationMin / 60)}h ${block.durationMin % 60}m`;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.wrapper,
          { top: baseTop, height, left: LEFT_OFFSET, right: RIGHT_MARGIN },
          animStyle,
        ]}
      >
        {/* Drag time badge */}
        {dragLabel !== null && (
          <View style={[styles.timeBadge, { backgroundColor: accent }]}>
            <Text style={styles.timeBadgeText}>{dragLabel}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.block,
            { height },
            isCurrent && { borderColor: accent },
            isCompleted && styles.blockDone,
          ]}
          onPress={handlePress}
          activeOpacity={0.82}
        >
          {/* Progressive fill — covers top portion based on elapsed time */}
          {fillPct > 0 && (
            <View
              style={[
                styles.fillLayer,
                {
                  height: `${Math.round(Math.min(100, fillPct * 100))}%`,
                  backgroundColor: fillColor,
                },
              ]}
            />
          )}

          {/* Domain accent stripe on the left */}
          <View
            style={[
              styles.accentStripe,
              { backgroundColor: accent, opacity: isPast ? 0.4 : 1 },
            ]}
          />

          {/* Text content */}
          <View style={styles.textArea}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{block.icon}</Text>
              <Text
                style={[styles.title, (isPast || isCompleted) && styles.titleFaded]}
                numberOfLines={height > 68 ? 2 : 1}
              >
                {block.title}
              </Text>
              {isCompleted && (
                <Text style={[styles.doneMark, { color: accent }]}>✓</Text>
              )}
              {isTimerActive && (
                <View style={[styles.timerDot, { backgroundColor: accent }]} />
              )}
            </View>

            {height > 64 && (
              <Text style={[styles.timeMeta, isPast && styles.timeMetaFaded]}>
                {formatTime(block.startHour, block.startMin)}
                {' – '}
                {formatTime(endH, endM)}
                {'  ·  '}
                {durationStr}
              </Text>
            )}

            {/* Slim progress bar for the currently active block */}
            {isCurrent && height > 52 && (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(fillPct * 100)}%`, backgroundColor: accent },
                  ]}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
  },
  timeBadge: {
    position: 'absolute',
    top: -28,
    left: 0,
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
    alignItems: 'stretch',
    backgroundColor: Dark.block,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Dark.border,
  },
  fillLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  accentStripe: {
    width: 3,
    borderRadius: 2,
    marginVertical: 10,
    marginLeft: 10,
    flexShrink: 0,
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Dark.text,
    lineHeight: 18,
  },
  titleFaded: {
    color: Dark.sub,
    fontWeight: '500',
  },
  doneMark: {
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 0,
  },
  timerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  timeMeta: {
    fontSize: 11,
    color: Dark.subLight,
    marginTop: 1,
  },
  timeMetaFaded: {
    color: Dark.sub,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: Dark.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  blockDone: {
    opacity: 0.5,
  },
});
