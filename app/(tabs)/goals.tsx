import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dark } from '../../src/colors';
import { useGoalStore } from '../../src/store/useGoalStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { useBlockStore } from '../../src/store/useBlockStore';
import { DomainRing } from '../../src/components/DomainRing';
import { formatDuration } from '../../src/utils/time';

// Domain accent colors (dark theme, inline)
const SLEEP_ACCENT = '#9B8FE0';
const SLEEP_FILL = 'rgba(155,143,224,0.18)';
const STUDY_ACCENT = '#E8604C';
const STUDY_FILL = 'rgba(232,96,76,0.15)';
const SCHEDULE_ACCENT = '#F5A623';
const SCHEDULE_FILL = 'rgba(245,166,35,0.15)';

export default function GoalsScreen() {
  const getCurrentGoal = useGoalStore((s) => s.getCurrentGoal);
  const updateCurrentGoal = useGoalStore((s) => s.updateCurrentGoal);
  const getLast7Entries = useSleepStore((s) => s.getLast7Entries);
  const getTodayBlocks = useBlockStore((s) => s.getTodayBlocks);

  const goal = getCurrentGoal();
  const sleepEntries = getLast7Entries();
  const todayBlocks = getTodayBlocks();

  // Calculate actuals
  const avgSleepMin =
    sleepEntries.length > 0
      ? sleepEntries.reduce((sum, e) => sum + e.durationMin, 0) / sleepEntries.length
      : 0;

  const totalStudyMin = todayBlocks
    .filter((b) => b.domain === 'study')
    .reduce((sum, b) => sum + b.durationMin, 0);

  const totalBlocks = todayBlocks.length;
  const completedBlocks = todayBlocks.filter((b) => b.completedAt !== undefined).length;
  const completionPct = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  // Progress values (0-1)
  const sleepProgress = goal.sleepNightlyTargetMin > 0 ? avgSleepMin / goal.sleepNightlyTargetMin : 0;
  const studyProgress = goal.studyWeeklyTargetMin > 0 ? totalStudyMin / goal.studyWeeklyTargetMin : 0;
  const scheduleProgress =
    goal.scheduleCompletionTargetPct > 0 ? completionPct / goal.scheduleCompletionTargetPct : 0;

  function adjustGoal(
    field: 'sleepNightlyTargetMin' | 'studyWeeklyTargetMin' | 'scheduleCompletionTargetPct',
    delta: number
  ) {
    const current = goal[field];
    const newVal = Math.max(0, current + delta);
    updateCurrentGoal({ [field]: newVal });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.subtitle}>Week of {goal.weekStartDate}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Progress rings row */}
        <View style={styles.ringsRow}>
          <View style={styles.ringItem}>
            <DomainRing
              size={100}
              strokeWidth={10}
              progress={sleepProgress}
              color={SLEEP_ACCENT}
              bgColor={SLEEP_FILL}
              label={`${Math.round(sleepProgress * 100)}%`}
              subLabel="Sleep"
            />
          </View>
          <View style={styles.ringItem}>
            <DomainRing
              size={100}
              strokeWidth={10}
              progress={studyProgress}
              color={STUDY_ACCENT}
              bgColor={STUDY_FILL}
              label={`${Math.round(studyProgress * 100)}%`}
              subLabel="Study"
            />
          </View>
          <View style={styles.ringItem}>
            <DomainRing
              size={100}
              strokeWidth={10}
              progress={scheduleProgress}
              color={SCHEDULE_ACCENT}
              bgColor={SCHEDULE_FILL}
              label={`${Math.round(scheduleProgress * 100)}%`}
              subLabel="Done"
            />
          </View>
        </View>

        {/* Sleep goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>😴</Text>
            <View style={styles.goalTitleGroup}>
              <Text style={styles.goalTitle}>Nightly Sleep Target</Text>
              <Text style={styles.goalActual}>
                Avg: {formatDuration(Math.round(avgSleepMin))} / night
              </Text>
            </View>
          </View>
          <View style={styles.goalControls}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('sleepNightlyTargetMin', -15)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.goalValueBox}>
              <Text style={[styles.goalValue, { color: SLEEP_ACCENT }]}>
                {formatDuration(goal.sleepNightlyTargetMin)}
              </Text>
              <Text style={styles.goalValueSub}>target</Text>
            </View>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('sleepNightlyTargetMin', 15)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, sleepProgress * 100)}%`,
                  backgroundColor: SLEEP_ACCENT,
                },
              ]}
            />
          </View>
        </View>

        {/* Study goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>📚</Text>
            <View style={styles.goalTitleGroup}>
              <Text style={styles.goalTitle}>Weekly Study Target</Text>
              <Text style={styles.goalActual}>
                Today: {formatDuration(totalStudyMin)}
              </Text>
            </View>
          </View>
          <View style={styles.goalControls}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('studyWeeklyTargetMin', -30)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.goalValueBox}>
              <Text style={[styles.goalValue, { color: STUDY_ACCENT }]}>
                {formatDuration(goal.studyWeeklyTargetMin)}
              </Text>
              <Text style={styles.goalValueSub}>/ week</Text>
            </View>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('studyWeeklyTargetMin', 30)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, studyProgress * 100)}%`,
                  backgroundColor: STUDY_ACCENT,
                },
              ]}
            />
          </View>
        </View>

        {/* Schedule completion goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>✅</Text>
            <View style={styles.goalTitleGroup}>
              <Text style={styles.goalTitle}>Schedule Completion Target</Text>
              <Text style={styles.goalActual}>
                Today: {completedBlocks}/{totalBlocks} blocks ({Math.round(completionPct)}%)
              </Text>
            </View>
          </View>
          <View style={styles.goalControls}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('scheduleCompletionTargetPct', -5)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.goalValueBox}>
              <Text style={[styles.goalValue, { color: SCHEDULE_ACCENT }]}>
                {goal.scheduleCompletionTargetPct}%
              </Text>
              <Text style={styles.goalValueSub}>target</Text>
            </View>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjustGoal('scheduleCompletionTargetPct', 5)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, scheduleProgress * 100)}%`,
                  backgroundColor: SCHEDULE_ACCENT,
                },
              ]}
            />
          </View>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week at a Glance</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryChip, { backgroundColor: SLEEP_FILL }]}>
              <Text style={[styles.summaryChipLabel, { color: SLEEP_ACCENT }]}>
                😴 {Math.round(sleepProgress * 100)}% sleep goal
              </Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: STUDY_FILL }]}>
              <Text style={[styles.summaryChipLabel, { color: STUDY_ACCENT }]}>
                📚 {Math.round(studyProgress * 100)}% study goal
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryChip, { backgroundColor: SCHEDULE_FILL }]}>
              <Text style={[styles.summaryChipLabel, { color: SCHEDULE_ACCENT }]}>
                ✅ {Math.round(scheduleProgress * 100)}% schedule goal
              </Text>
            </View>
          </View>
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
    paddingVertical: 16,
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
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Dark.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Dark.border,
  },
  ringItem: {
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: Dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Dark.border,
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalTitleGroup: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Dark.text,
  },
  goalActual: {
    fontSize: 12,
    color: Dark.sub,
    marginTop: 2,
  },
  goalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  adjustBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Dark.border,
  },
  adjustBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: Dark.text,
    lineHeight: 28,
  },
  goalValueBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  goalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  goalValueSub: {
    fontSize: 11,
    color: Dark.sub,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Dark.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  summaryCard: {
    backgroundColor: Dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Dark.border,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Dark.text,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryChipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
