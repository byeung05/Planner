import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dark } from '../colors';
import { formatDuration, formatTime } from '../utils/time';
import { HOUR_HEIGHT, START_HOUR } from './TimelineBlock';

const SPINE_X = 52;

interface Props {
  startHour: number;
  startMin: number;
  gapMinutes: number;
  onPress?: () => void;
}

export function GapIndicator({ startHour, startMin, gapMinutes, onPress }: Props) {
  const offsetMin = startHour * 60 + startMin - START_HOUR * 60;
  const top = (offsetMin / 60) * HOUR_HEIGHT;
  const height = (gapMinutes / 60) * HOUR_HEIGHT;
  const centerY = height / 2;

  return (
    <View style={[styles.wrapper, { top, height }]} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.inner, { top: centerY - 12 }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>⏱</Text>
        <Text style={styles.label}>
          {formatDuration(gapMinutes)} free
        </Text>
        <View style={styles.addPill}>
          <Text style={styles.addText}>+ Add</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPINE_X + 30,
    right: 12,
    pointerEvents: 'box-none',
  },
  inner: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 12,
    color: Dark.sub,
  },
  label: {
    fontSize: 12,
    color: Dark.sub,
    fontWeight: '500',
  },
  addPill: {
    backgroundColor: Dark.accentBg,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  addText: {
    fontSize: 11,
    color: Dark.accent,
    fontWeight: '700',
  },
});
