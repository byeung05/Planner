import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dark } from '../../src/colors';
import { useBlockStore } from '../../src/store/useBlockStore';
import { todayDateString, formatTime } from '../../src/utils/time';

// Domain accent colors (dark theme)
const DOMAIN_ACCENT: Record<string, string> = {
  sleep: '#9B8FE0',
  study: '#E8604C',
  schedule: '#F5A623',
};
const DOMAIN_FILL: Record<string, string> = {
  sleep: 'rgba(155,143,224,0.18)',
  study: 'rgba(232,96,76,0.15)',
  schedule: 'rgba(245,166,35,0.15)',
};

// Timeline constants: 6am–11pm = 17 hours = 1020 minutes
const TIMELINE_START_MIN = 6 * 60;   // 360
const TIMELINE_TOTAL_MIN = 17 * 60;  // 1020
const TIMELINE_HEIGHT = 220;

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Returns the Sunday–Saturday dates for the week containing `date`. */
function getWeekDays(date: Date): { dateStr: string; dayOfWeek: number }[] {
  const result: { dateStr: string; dayOfWeek: number }[] = [];
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    result.push({
      dateStr: d.toISOString().split('T')[0] ?? '',
      dayOfWeek: i,
    });
  }
  return result;
}

export default function WeekScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const colWidth = (screenWidth - 32) / 7;

  const blocks = useBlockStore((s) => s.blocks);
  const todayStr = todayDateString();

  const now = new Date();
  const weekDays = getWeekDays(now);
  const monthYear = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  // Today's blocks sorted by start time for the agenda
  const todayBlocks = blocks
    .filter((b) => b.createdAt === todayStr)
    .slice()
    .sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Week</Text>
        <Text style={styles.subtitle}>{monthYear}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 7-column grid */}
        <View style={styles.columnsRow}>
          {weekDays.map((day) => {
            const isToday = day.dateStr === todayStr;
            const dayBlocks = blocks.filter((b) => b.createdAt === day.dateStr);
            const dateNum = parseInt(day.dateStr.split('-')[2] ?? '0', 10);

            return (
              <View key={day.dateStr} style={[styles.column, { width: colWidth }]}>
                {/* Day letter */}
                <Text style={[styles.dayLetter, isToday && styles.dayLetterToday]}>
                  {DAY_LETTERS[day.dayOfWeek]}
                </Text>

                {/* Date circle */}
                <View style={[styles.dateBubble, isToday && styles.dateBubbleToday]}>
                  <Text style={[styles.dateNum, isToday && styles.dateNumToday]}>
                    {dateNum}
                  </Text>
                </View>

                {/* Mini timeline */}
                <View style={[styles.timelineBar, { height: TIMELINE_HEIGHT }]}>
                  {dayBlocks.map((block) => {
                    const blockStartMin = block.startHour * 60 + block.startMin;
                    const offsetMin = blockStartMin - TIMELINE_START_MIN;
                    const topPct = Math.max(0, offsetMin / TIMELINE_TOTAL_MIN);
                    const heightPct = Math.min(
                      1 - topPct,
                      block.durationMin / TIMELINE_TOTAL_MIN
                    );

                    if (topPct >= 1 || heightPct <= 0) return null;

                    const accent = DOMAIN_ACCENT[block.domain] ?? Dark.accent;
                    const fill = DOMAIN_FILL[block.domain] ?? Dark.accentBg;

                    return (
                      <View
                        key={block.id}
                        style={[
                          styles.blockPill,
                          {
                            top: topPct * TIMELINE_HEIGHT,
                            height: Math.max(3, heightPct * TIMELINE_HEIGHT),
                            backgroundColor: fill,
                            borderLeftColor: accent,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Today's agenda */}
        <View style={styles.agendaCard}>
          <Text style={styles.agendaTitle}>Today's agenda</Text>
          {todayBlocks.length === 0 ? (
            <Text style={styles.agendaEmpty}>No blocks today</Text>
          ) : (
            todayBlocks.map((block) => {
              const accent = DOMAIN_ACCENT[block.domain] ?? Dark.accent;
              const timeStr = formatTime(block.startHour, block.startMin);
              const endMin = block.startHour * 60 + block.startMin + block.durationMin;
              const endStr = formatTime(Math.floor(endMin / 60) % 24, endMin % 60);

              return (
                <View key={block.id} style={styles.agendaRow}>
                  <View style={[styles.agendaDot, { backgroundColor: accent }]} />
                  <Text style={styles.agendaIcon}>{block.icon}</Text>
                  <Text style={styles.agendaBlockTitle} numberOfLines={1}>
                    {block.title}
                  </Text>
                  <Text style={styles.agendaTime}>
                    {timeStr} – {endStr}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Dark.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Dark.text,
  },
  subtitle: {
    fontSize: 12,
    color: Dark.sub,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  columnsRow: {
    flexDirection: 'row',
    gap: 0,
  },
  column: {
    alignItems: 'center',
    gap: 4,
  },
  dayLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: Dark.sub,
    textTransform: 'uppercase',
  },
  dayLetterToday: {
    color: Dark.accent,
  },
  dateBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dateBubbleToday: {
    backgroundColor: Dark.accent,
  },
  dateNum: {
    fontSize: 12,
    fontWeight: '600',
    color: Dark.subLight,
  },
  dateNumToday: {
    color: Dark.text,
  },
  timelineBar: {
    width: '100%',
    backgroundColor: Dark.block,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  blockPill: {
    position: 'absolute',
    left: 1,
    right: 1,
    borderRadius: 2,
    borderLeftWidth: 2,
    minHeight: 3,
  },
  agendaCard: {
    backgroundColor: Dark.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Dark.border,
    gap: 10,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Dark.text,
    marginBottom: 2,
  },
  agendaEmpty: {
    fontSize: 13,
    color: Dark.sub,
    textAlign: 'center',
    paddingVertical: 12,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  agendaIcon: {
    fontSize: 15,
  },
  agendaBlockTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Dark.text,
  },
  agendaTime: {
    fontSize: 11,
    color: Dark.sub,
  },
});
