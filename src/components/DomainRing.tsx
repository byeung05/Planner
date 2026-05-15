import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DomainRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0–1
  color: string;
  bgColor: string;
  label?: string;
  subLabel?: string;
}

export function DomainRing({
  size,
  strokeWidth,
  progress,
  color,
  bgColor,
  label,
  subLabel,
}: DomainRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {(label !== undefined || subLabel !== undefined) && (
        <View style={styles.labelContainer}>
          {label !== undefined && (
            <Text style={[styles.label, { color }]}>{label}</Text>
          )}
          {subLabel !== undefined && (
            <Text style={styles.subLabel}>{subLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 10,
    color: '#7878A0',
    marginTop: 1,
  },
});
