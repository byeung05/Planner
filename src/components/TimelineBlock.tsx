import React, { useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Block } from '../types';
import { domainColors } from '../colors';
import { formatTime, formatDuration, snapToQuarter } from '../utils/time';
import { useBlockStore } from '../store/useBlockStore';

const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const BLOCK_LEFT = 56;
const BLOCK_RIGHT = 8;

interface TimelineBlockProps {
  block: Block;
  onPress: (block: Block) => void;
  isTimerActive?: boolean;
}

export function TimelineBlock({ block, onPress, isTimerActive = false }: TimelineBlockProps) {
  const moveBlock = useBlockStore((s) => s.moveBlock);
  const colors = domainColors(block.domain);

  const offsetMin = block.startHour * 60 + block.startMin - START_HOUR * 60;
  const baseTop = (offsetMin / 60) * HOUR_HEIGHT;
  const height = Math.max((block.durationMin / 60) * HOUR_HEIGHT, 28);

  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const onSnap = useCallback(
    (deltaY: number) => {
      const deltaMin = (deltaY / HOUR_HEIGHT) * 60;
      const newTotalMin = snapToQuarter(
        Math.max(0, Math.min(block.startHour * 60 + block.startMin + deltaMin, 23 * 60))
      );
      const newHour = Math.floor(newTotalMin / 60);
      const newMin = newTotalMin % 60;
      moveBlock(block.id, newHour, newMin);
    },
    [block.id, block.startHour, block.startMin, moveBlock]
  );

  type Context = { startY: number };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, Context>({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
      isDragging.value = true;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      isDragging.value = false;
      runOnJS(onSnap)(translateY.value);
      translateY.value = withSpring(0, { damping: 20 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 200 : 10,
    shadowOpacity: isDragging.value ? 0.3 : 0.08,
    elevation: isDragging.value ? 8 : 2,
  }));

  const isCompleted = Boolean(block.completedAt);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          styles.block,
          {
            top: baseTop,
            height,
            backgroundColor: colors.bg,
            borderColor: isTimerActive ? colors.accent : colors.border,
            borderWidth: isTimerActive ? 2 : 1,
            opacity: isCompleted ? 0.6 : 1,
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.inner}
          onPress={() => onPress(block)}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>{block.icon}</Text>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {block.title}
            </Text>
            {height > 44 && (
              <Text style={[styles.time, { color: colors.accent }]}>
                {formatTime(block.startHour, block.startMin)} · {formatDuration(block.durationMin)}
              </Text>
            )}
          </View>
          {isCompleted && (
            <Text style={styles.checkmark}>✓</Text>
          )}
          <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: BLOCK_LEFT,
    right: BLOCK_RIGHT,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  checkmark: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '700',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
});
