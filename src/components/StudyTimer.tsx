import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Block } from '../types';
import { Colors } from '../colors';
import { formatTimerSeconds } from '../utils/time';

interface Props {
  block: Block;
  onStop: () => void;
}

export function StudyTimer({ block, onStop }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = Math.min(elapsed / (block.durationMin * 60), 1);
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.icon}>{block.icon}</Text>
        <View>
          <Text style={styles.label} numberOfLines={1}>{block.title}</Text>
          <Text style={styles.pct}>{pct}% complete</Text>
        </View>
      </View>
      <Text style={styles.timer}>{formatTimerSeconds(elapsed)}</Text>
      <TouchableOpacity style={styles.stopBtn} onPress={onStop} activeOpacity={0.8}>
        <Text style={styles.stopText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.study.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.study.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 18 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.study.text,
  },
  pct: {
    fontSize: 11,
    color: Colors.study.accent,
    marginTop: 1,
  },
  timer: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.study.accent,
    fontVariant: ['tabular-nums'],
  },
  stopBtn: {
    backgroundColor: Colors.study.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stopText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
