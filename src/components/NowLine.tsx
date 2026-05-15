import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { currentTimeMinutes } from '../utils/time';

const HOUR_HEIGHT = 60;
const START_HOUR = 6;

interface NowLineProps {
  visible?: boolean;
}

export function NowLine({ visible = true }: NowLineProps) {
  const [minutes, setMinutes] = useState(currentTimeMinutes());

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(currentTimeMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const offsetMinutes = minutes - START_HOUR * 60;
  if (offsetMinutes < 0) return null;

  const top = (offsetMinutes / 60) * HOUR_HEIGHT;

  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <View style={styles.dot} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 48,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.nowLine,
    marginLeft: -5,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.nowLine,
    opacity: 0.8,
  },
});
