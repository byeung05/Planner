import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/colors';
import { useSleepStore } from '../../src/store/useSleepStore';
import { useBlockStore } from '../../src/store/useBlockStore';
import { useGoalStore } from '../../src/store/useGoalStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { formatDuration, shortDayLabel } from '../../src/utils/time';

type TabKey = 'sleep' | 'study' | 'days';

const BAR_MAX_WIDTH = 220;

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('sleep');
  const getLast7Entries = useSleepStore((s) => s.getLast7Entries);
  const getTodayBlocks = useBlockStore((s) => s.getTodayBlocks);
  const getCurrentGoal = useGoalStore((s) => s.getCurrentGoal);

  const sleepEntries = getLast7Entries();
  const todayBlocks = getTodayBlocks();
  const currentGoal = getCurrentGoal();

  // ---- Sleep tab data ----
  const maxSleepMin = Math.max(...sleepEntries.map((e) => e.durationMin), currentGoal.sleepNightlyTargetMin);

  // ---- Study tab data ----
  const studyBlocks = todayBlocks.filter((b) => b.domain === 'study');
  const subjectMap = new Map<string, { title: string; icon: string; totalMin: number }>();
  for (const b of studyBlocks) {
    const key = b.title;
    const existing = subjectMap.get(key);
    if (existing) {
      existing.totalMin += b.durationMin;
    } else {
      subjectMap.set(key, { title: b.title, icon: b.icon, totalMin: b.durationMin });
    }
  }
  const subjects = Array.from(subjectMap.values()).sort((a, b) => b.totalMin - a.totalMin);
  const maxStudyMin = Math.max(...subjects.map((s) => s.totalMin), 60);

  // ---- Days tab data ----
  const totalBlocks = todayBlocks.length;
  const completedBlocks = todayBlocks.filter((b) => b.completedAt !== undefined).length;
  const completionPct = totalBlocks > 0 ? completedBlocks / totalBlocks : 0;

  // Per-sleep-entry completion (reuse sleep entries as proxy for "days")
  const dayCompletions = sleepEntries.map((entry) => ({
    date: entry.date,
    label: shortDayLabel(entry.date),
    pct: entry.quality / 5,
    quality: entry.quality,
  }));

  const tabs: Array<{ key: TabKey; label: string; emoji: string }> = [
    { key: 'sleep', label: 'Sleep', emoji: '😴' },
    { key: 'study', label: 'Study', emoji: '📚' },
    { key: 'days', label: 'Days', emoji: '📅' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Stats</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* ---- Sleep Tab ---- */}
        {activeTab === 'sleep' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last 7 Nights</Text>
            {sleepEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>😴</Text>
                <Text style={styles.emptyText}>No sleep data yet</Text>
              </View>
            ) : (
              sleepEntries.map((entry) => (
                <View key={entry.id} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barDay}>{shortDayLabel(entry.date)}</Text>
                    {entry.moodEmoji !== undefined && (
                      <Text style={styles.moodEmoji}>{entry.moodEmoji}</Text>
                    )}
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, (entry.durationMin / maxSleepMin) * 100)}%`,
                          backgroundColor: Colors.sleep.accent,
                        },
                      ]}
                    />
                    {/* Target marker */}
                    <View
                      style={[
                        styles.targetMarker,
                        {
                          left: `${Math.min(99, (currentGoal.sleepNightlyTargetMin / maxSleepMin) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{formatDuration(entry.durationMin)}</Text>
                </View>
              ))
            )}
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: Colors.sleep.accent }]} />
              <Text style={styles.legendLabel}>Sleep duration</Text>
              <View style={[styles.legendLine, { backgroundColor: Colors.sub }]} />
              <Text style={styles.legendLabel}>Target ({formatDuration(currentGoal.sleepNightlyTargetMin)})</Text>
            </View>
          </View>
        )}

        {/* ---- Study Tab ---- */}
        {activeTab === 'study' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Study Sessions</Text>
            {subjects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyText}>No study blocks today</Text>
                <Text style={styles.emptySubtext}>Add a study block to track your sessions</Text>
              </View>
            ) : (
              subjects.map((subject, i) => (
                <View key={i} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                    <Text style={styles.subjectName}>{subject.title}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, (subject.totalMin / maxStudyMin) * 100)}%`,
                          backgroundColor: Colors.study.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{formatDuration(subject.totalMin)}</Text>
                </View>
              ))
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total today</Text>
              <Text style={[styles.totalValue, { color: Colors.study.accent }]}>
                {formatDuration(subjects.reduce((sum, s) => sum + s.totalMin, 0))}
              </Text>
            </View>
          </View>
        )}

        {/* ---- Days Tab ---- */}
        {activeTab === 'days' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Quality Score (7 days)</Text>
            {dayCompletions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📅</Text>
                <Text style={styles.emptyText}>No data yet</Text>
              </View>
            ) : (
              dayCompletions.map((day, i) => (
                <View key={i} style={styles.barRow}>
                  <Text style={styles.barDay}>{day.label}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${day.pct * 100}%`,
                          backgroundColor: qualityColor(day.quality),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{Math.round(day.pct * 100)}%</Text>
                </View>
              ))
            )}

            {/* Today's schedule completion */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <ProgressBar
              progress={completionPct}
              color={Colors.schedule.accent}
              bgColor={Colors.schedule.bg}
              height={12}
              label="Blocks completed"
              rightLabel={`${completedBlocks}/${totalBlocks}`}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function qualityColor(quality: number): string {
  if (quality >= 4) return Colors.sleep.accent;
  if (quality >= 3) return Colors.schedule.accent;
  return Colors.study.accent;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.bg,
  },
  tabActive: {
    backgroundColor: Colors.text,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.sub,
  },
  tabLabelActive: {
    color: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    gap: 4,
  },
  barDay: {
    width: 36,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  moodEmoji: {
    fontSize: 14,
  },
  subjectIcon: {
    fontSize: 16,
  },
  subjectName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: 20,
    borderRadius: 10,
  },
  targetMarker: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 2,
    backgroundColor: Colors.sub,
    opacity: 0.6,
  },
  barValue: {
    width: 48,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.sub,
    textAlign: 'right',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginLeft: 8,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.sub,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.sub,
    textAlign: 'center',
  },
});
