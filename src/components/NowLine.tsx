import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dark } from '../colors';
import { currentTimeMinutes, formatTime } from '../utils/time';
import { HOUR_HEIGHT, START_HOUR } from './TimelineBlock';

const SPINE_X = 52;

export function NowLine() {
  const [minutes, setMinutes] = useState(currentTimeMinutes());

  useEffect(() => {
    const id = setInterval(() => setMinutes(currentTimeMinutes()), 30_000);
    return () => clearInterval(id);
  }, []);

  const offsetMin = minutes - START_HOUR * 60;
  if (offsetMin < 0) return null;

  const top = (offsetMin / 60) * HOUR_HEIGHT;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <Text style={styles.timeLabel}>{formatTime(h, m)}</Text>
      <View style={styles.dot} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 200,
  },
  timeLabel: {
    width: SPINE_X - 14,
    fontSize: 10,
    fontWeight: '700',
    color: Dark.accent,
    textAlign: 'right',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Dark.accent,
    marginLeft: 4,
    shadowColor: Dark.accent,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: Dark.accent,
    opacity: 0.5,
    marginLeft: 0,
  },
});
