import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dark, DomainDark } from '../../src/colors';
import { useBlockStore } from '../../src/store/useBlockStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { TimelineBlock, HOUR_HEIGHT, START_HOUR } from '../../src/components/TimelineBlock';
import { GapIndicator } from '../../src/components/GapIndicator';
import { NowLine } from '../../src/components/NowLine';
import { StudyTimer } from '../../src/components/StudyTimer';
import { Block } from '../../src/types';
import {
  currentTimeMinutes,
  blockEndMinutes,
  todayDateString,
  formatTime,
} from '../../src/utils/time';

const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const TIMELINE_HEIGHT = HOURS.length * HOUR_HEIGHT;
const MIN_GAP = 20;
const SPINE_X = 52;

// ── Week strip helpers ──────────────────────────────────────
function getWeekDays(): Array<{ label: string; num: number; date: Date; isToday: boolean }> {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    return {
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i] ?? '',
      num: d.getDate(),
      date: d,
      isToday: i === dow,
    };
  });
}

function getNextBlockMinutes(blocks: Block[]): number | null {
  const now = currentTimeMinutes();
  const upcoming = blocks
    .filter((b) => b.startHour * 60 + b.startMin > now)
    .sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin));
  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  if (!next) return null;
  return next.startHour * 60 + next.startMin - now;
}

// ── Component ───────────────────────────────────────────────
export default function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const getTodayBlocks    = useBlockStore((s) => s.getTodayBlocks);
  const activeTimerBlockId = useBlockStore((s) => s.activeTimerBlockId);
  const setActiveTimer    = useBlockStore((s) => s.setActiveTimer);
  const morningRevealDate = useSleepStore((s) => s.morningRevealShownDate);
  const getLastNightEntry = useSleepStore((s) => s.getLastNightEntry);

  const blocks = getTodayBlocks();
  const activeTimerBlock = blocks.find((b) => b.id === activeTimerBlockId) ?? null;
  const weekDays = useMemo(getWeekDays, []);

  // Morning reveal check
  useEffect(() => {
    const hour = new Date().getHours();
    if (
      hour >= 5 && hour < 10 &&
      getLastNightEntry() !== null &&
      morningRevealDate !== todayDateString()
    ) {
      router.push('/morning-reveal');
    }
  }, []);

  // Scroll to now on mount
  useEffect(() => {
    const nowMin = currentTimeMinutes();
    const offset = Math.max(0, ((nowMin - START_HOUR * 60) / 60) * HOUR_HEIGHT - 140);
    setTimeout(() => scrollRef.current?.scrollTo({ y: offset, animated: true }), 400);
  }, []);

  // Gaps
  const gaps = useMemo(() => {
    const out: Array<{ startHour: number; startMin: number; gapMin: number }> = [];
    for (let i = 0; i < blocks.length - 1; i++) {
      const cur = blocks[i]!;
      const nxt = blocks[i + 1]!;
      const end = blockEndMinutes(cur.startHour, cur.startMin, cur.durationMin);
      const gap = nxt.startHour * 60 + nxt.startMin - end;
      if (gap >= MIN_GAP) {
        out.push({ startHour: Math.floor(end / 60), startMin: end % 60, gapMin: gap });
      }
    }
    return out;
  }, [blocks]);

  // Time labels — only at block boundaries
  const timeLabelSet = useMemo(() => {
    const set = new Set<number>();
    blocks.forEach((b) => {
      set.add(b.startHour * 60 + b.startMin);
      set.add(blockEndMinutes(b.startHour, b.startMin, b.durationMin));
    });
    return set;
  }, [blocks]);

  const nextBlockMins = getNextBlockMinutes(blocks);

  function handleBlockPress(block: Block) {
    if (block.domain === 'study') {
      setActiveTimer(activeTimerBlockId === block.id ? null : block.id);
    } else {
      router.push({ pathname: '/block-detail', params: { blockId: block.id } });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Date header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.dateRow} activeOpacity={0.7}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })},{' '}
            <Text style={styles.dateYear}>{new Date().getFullYear()}</Text>
            <Text style={styles.dateChevron}> ›</Text>
          </Text>
        </TouchableOpacity>

        {/* Week strip */}
        <View style={styles.weekStrip}>
          {weekDays.map((d) => (
            <View key={d.num} style={styles.weekDay}>
              <Text style={styles.weekDayLabel}>{d.label}</Text>
              <View style={[styles.weekDayNum, d.isToday && styles.weekDayNumToday]}>
                <Text style={[styles.weekDayNumText, d.isToday && styles.weekDayNumTextToday]}>
                  {d.num}
                </Text>
              </View>
              {/* Domain dots */}
              <View style={styles.domainDots}>
                {d.isToday && blocks.length > 0 && (
                  <>
                    {blocks.some((b) => b.domain === 'sleep') && (
                      <View style={[styles.dot, { backgroundColor: DomainDark.sleep.dot }]} />
                    )}
                    {blocks.some((b) => b.domain === 'study') && (
                      <View style={[styles.dot, { backgroundColor: DomainDark.study.dot }]} />
                    )}
                    {blocks.some((b) => b.domain === 'schedule') && (
                      <View style={[styles.dot, { backgroundColor: DomainDark.schedule.dot }]} />
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Next up banner ── */}
      {nextBlockMins !== null && nextBlockMins <= 30 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⏱ Next up in{' '}
            <Text style={styles.bannerAccent}>{nextBlockMins}min</Text>
            .  Ready?
          </Text>
        </View>
      )}

      {/* ── Study timer ── */}
      {activeTimerBlock !== null && (
        <StudyTimer block={activeTimerBlock} onStop={() => setActiveTimer(null)} />
      )}

      {/* ── Timeline ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.timeline, { height: TIMELINE_HEIGHT + 40 }]}>

          {/* Spine */}
          <View style={styles.spine} />

          {/* Hour rows — labels only at block boundaries */}
          {HOURS.map((hour) => {
            const showLabel = timeLabelSet.has(hour * 60) || hour % 3 === 0;
            return (
              <View key={hour} style={[styles.hourRow, { top: (hour - START_HOUR) * HOUR_HEIGHT }]}>
                {showLabel ? (
                  <Text style={styles.hourLabel}>{formatTime(hour, 0)}</Text>
                ) : (
                  <View style={styles.hourLabelSpace} />
                )}
                <View style={styles.hourTick} />
              </View>
            );
          })}

          {/* Blocks */}
          {blocks.map((block) => (
            <TimelineBlock
              key={block.id}
              block={block}
              onPress={handleBlockPress}
              isTimerActive={block.id === activeTimerBlockId}
            />
          ))}

          {/* Gaps */}
          {gaps.map((g, i) => (
            <GapIndicator
              key={`gap-${i}`}
              startHour={g.startHour}
              startMin={g.startMin}
              gapMinutes={g.gapMin}
              onPress={() => router.push('/add-block')}
            />
          ))}

          {/* Now line */}
          <NowLine />
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-block')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Dark.bg,
  },

  // Header
  header: {
    backgroundColor: Dark.bg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Dark.border,
  },
  dateRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 28,
    fontWeight: '800',
    color: Dark.text,
    letterSpacing: -0.5,
  },
  dateYear: {
    color: Dark.accent,
  },
  dateChevron: {
    color: Dark.accent,
    fontWeight: '400',
  },

  // Week strip
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  weekDayLabel: {
    fontSize: 10,
    color: Dark.sub,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weekDayNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNumToday: {
    backgroundColor: Dark.accent,
  },
  weekDayNumText: {
    fontSize: 14,
    fontWeight: '700',
    color: Dark.subLight,
  },
  weekDayNumTextToday: {
    color: '#fff',
  },
  domainDots: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Banner
  banner: {
    backgroundColor: Dark.accentBg,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Dark.border,
  },
  bannerText: {
    fontSize: 13,
    color: Dark.subLight,
    fontWeight: '500',
  },
  bannerAccent: {
    color: Dark.accent,
    fontWeight: '700',
  },

  // Timeline
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  timeline: {
    position: 'relative',
    marginTop: 8,
  },

  // Spine — dashed vertical line
  spine: {
    position: 'absolute',
    left: SPINE_X,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: Dark.spine,
    borderStyle: 'dashed',
    zIndex: 1,
  },

  // Hour rows
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 1,
  },
  hourLabel: {
    width: SPINE_X - 6,
    fontSize: 10,
    color: Dark.sub,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: -8,
  },
  hourLabelSpace: {
    width: SPINE_X - 6,
  },
  hourTick: {
    width: 6,
    height: 1,
    backgroundColor: Dark.spine,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Dark.accent,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 500,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 34,
  },
});
