import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../colors';
import { formatDuration, formatTime } from '../utils/time';

const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const BLOCK_HORIZONTAL_MARGIN = 56;

interface GapIndicatorProps {
  startHour: number;
  startMin: number;
  gapMinutes: number;
  onPress?: () => void;
}

export function GapIndicator({ startHour, startMin, gapMinutes, onPress }: GapIndicatorProps) {
  const offsetMin = startHour * 60 + startMin - START_HOUR * 60;
  const top = (offsetMin / 60) * HOUR_HEIGHT;
  const height = Math.max((gapMinutes / 60) * HOUR_HEIGHT, 20);

  return (
    <TouchableOpacity
      style={[styles.container, { top, height }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{formatDuration(gapMinutes)} free</Text>
      <Text style={styles.subLabel}>{formatTime(startHour, startMin)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: BLOCK_HORIZONTAL_MARGIN,
    right: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: Colors.sub,
    fontWeight: '500',
  },
  subLabel: {
    fontSize: 10,
    color: Colors.sub,
    opacity: 0.7,
  },
});
