import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../colors';

interface ProgressBarProps {
  progress: number; // 0–1
  color: string;
  bgColor?: string;
  height?: number;
  label?: string;
  subLabel?: string;
  rightLabel?: string;
}

export function ProgressBar({
  progress,
  color,
  bgColor = Colors.border,
  height = 8,
  label,
  subLabel,
  rightLabel,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {(label !== undefined || rightLabel !== undefined) && (
        <View style={styles.labelRow}>
          <View>
            {label !== undefined && (
              <Text style={styles.label}>{label}</Text>
            )}
            {subLabel !== undefined && (
              <Text style={styles.subLabel}>{subLabel}</Text>
            )}
          </View>
          {rightLabel !== undefined && (
            <Text style={[styles.rightLabel, { color }]}>{rightLabel}</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: bgColor, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  subLabel: {
    fontSize: 11,
    color: Colors.sub,
    marginTop: 1,
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {},
});
