import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/colors';
import { useBlockStore } from '../../src/store/useBlockStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { TimelineBlock } from '../../src/components/TimelineBlock';
import { GapIndicator } from '../../src/components/GapIndicator';
import { NowLine } from '../../src/components/NowLine';
import { StudyTimer } from '../../src/components/StudyTimer';
import { Block } from '../../src/types';
import { formatHour, currentTimeMinutes, blockEndMinutes, todayDateString } from '../../src/utils/time';

const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const TIMELINE_HEIGHT = HOURS.length * HOUR_HEIGHT;
const MIN_GAP = 20;

export default function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const getTodayBlocks = useBlockStore((s) => s.getTodayBlocks);
  const activeTimerBlockId = useBlockStore((s) => s.activeTimerBlockId);
  const setActiveTimer = useBlockStore((s) => s.setActiveTimer);
  const morningRevealShownDate = useSleepStore((s) => s.morningRevealShownDate);
  const getLastNightEntry = useSleepStore((s) => s.getLastNightEntry);

  const blocks = getTodayBlocks();
  const activeTimerBlock = blocks.find((b) => b.id === activeTimerBlockId) ?? null;

  // Check morning reveal on mount
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const today = todayDateString();
    const lastNight = getLastNightEntry();

    if (
      hour >= 5 &&
      hour < 10 &&
      lastNight !== null &&
      morningRevealShownDate !== today
    ) {
      router.push('/morning-reveal');
    }
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    const nowMin = currentTimeMinutes();
    const offsetMin = nowMin - START_HOUR * 60;
    if (offsetMin > 0) {
      const scrollY = Math.max(0, (offsetMin / 60) * HOUR_HEIGHT - 120);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: scrollY, animated: true });
      }, 400);
    }
  }, []);

  function handleBlockPress(block: Block) {
    if (block.domain === 'study') {
      if (activeTimerBlockId === block.id) {
        setActiveTimer(null);
      } else {
        setActiveTimer(block.id);
      }
    } else {
      router.push({ pathname: '/block-detail', params: { blockId: block.id } });
    }
  }

  // Compute gaps
  function computeGaps() {
    const gaps: Array<{ startHour: number; startMin: number; gapMinutes: number }> = [];
    if (blocks.length < 2) return gaps;

    for (let i = 0; i < blocks.length - 1; i++) {
      const curr = blocks[i];
      const next = blocks[i + 1];
      const currEnd = blockEndMinutes(curr.startHour, curr.startMin, curr.durationMin);
      const nextStart = next.startHour * 60 + next.startMin;
      const gap = nextStart - currEnd;

      if (gap >= MIN_GAP) {
        const gapStartHour = Math.floor(currEnd / 60);
        const gapStartMin = currEnd % 60;
        gaps.push({ startHour: gapStartHour, startMin: gapStartMin, gapMinutes: gap });
      }
    }
    return gaps;
  }

  const gaps = computeGaps();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.title}>Today</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-block')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Active Timer Banner */}
      {activeTimerBlock !== null && (
        <StudyTimer
          block={activeTimerBlock}
          onStop={() => setActiveTimer(null)}
        />
      )}

      {/* Timeline */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.timeline, { height: TIMELINE_HEIGHT }]}>
          {/* Hour rows */}
          {HOURS.map((hour) => (
            <View
              key={hour}
              style={[styles.hourRow, { top: (hour - START_HOUR) * HOUR_HEIGHT }]}
            >
              <Text style={styles.hourLabel}>{formatHour(hour)}</Text>
              <View style={styles.hourLine} />
            </View>
          ))}

          {/* Gap indicators */}
          {gaps.map((gap, i) => (
            <GapIndicator
              key={`gap-${i}`}
              startHour={gap.startHour}
              startMin={gap.startMin}
              gapMinutes={gap.gapMinutes}
              onPress={() => router.push('/add-block')}
            />
          ))}

          {/* Blocks */}
          {blocks.map((block) => (
            <TimelineBlock
              key={block.id}
              block={block}
              onPress={handleBlockPress}
              isTimerActive={block.id === activeTimerBlockId}
            />
          ))}

          {/* Now line */}
          <NowLine />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.sub,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.study.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  timeline: {
    marginHorizontal: 8,
    position: 'relative',
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: HOUR_HEIGHT,
  },
  hourLabel: {
    width: 48,
    fontSize: 10,
    color: Colors.sub,
    fontWeight: '500',
    textAlign: 'right',
    paddingRight: 8,
    marginTop: -6,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 0,
  },
});
