import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../src/colors';
import { useSleepStore } from '../src/store/useSleepStore';
import { useGoalStore } from '../src/store/useGoalStore';
import { DomainRing } from '../src/components/DomainRing';
import { formatDurationLong, todayDateString } from '../src/utils/time';

const MOODS = ['😫', '😴', '😐', '🙂', '😄'];

export default function MorningRevealScreen() {
  const router = useRouter();
  const getLastNightEntry = useSleepStore((s) => s.getLastNightEntry);
  const updateEntry       = useSleepStore((s) => s.updateEntry);
  const setShownDate      = useSleepStore((s) => s.setMorningRevealShownDate);
  const getCurrentGoal    = useGoalStore((s) => s.getCurrentGoal);

  const entry = getLastNightEntry();
  const goal  = getCurrentGoal();

  const [selectedMood, setSelectedMood] = useState<string | null>(entry?.moodEmoji ?? null);

  if (!entry) {
    router.back();
    return null;
  }

  const targetMin = goal.sleepNightlyTargetMin;
  const score = Math.min(100, Math.round((entry.durationMin / targetMin) * 100));
  const progress = Math.min(1, entry.durationMin / targetMin);

  // Simple stage estimates from duration
  const remPct   = Math.round(20 + (entry.quality - 1) * 2);
  const deepPct  = Math.round(15 + (entry.quality - 1) * 2);
  const lightPct = 100 - remPct - deepPct;

  function handleStartDay() {
    if (selectedMood && entry) {
      updateEntry(entry.id, { moodEmoji: selectedMood });
    }
    setShownDate(todayDateString());
    router.back();
  }

  const scoreColor = score >= 85 ? Colors.schedule.accent : score >= 65 ? Colors.sleep.accent : '#E05A42';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.duration}>{formatDurationLong(entry.durationMin)}</Text>
          <Text style={styles.durationSub}>of sleep last night</Text>
        </View>

        {/* Score ring */}
        <View style={styles.ringWrap}>
          <DomainRing
            progress={progress}
            size={140}
            strokeWidth={14}
            color={scoreColor}
            bgColor={Colors.sleep.bg}
          />
          <View style={styles.ringCenter}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
            <Text style={styles.scoreSub}>/ 100</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{entry.bedtime}</Text>
            <Text style={styles.statLabel}>Bedtime</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{entry.wakeTime}</Text>
            <Text style={styles.statLabel}>Wake time</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{entry.quality}/5</Text>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
        </View>

        {/* Stage breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep breakdown</Text>
          <View style={styles.stageRow}>
            <View style={styles.stageItem}>
              <View style={[styles.stageDot, { backgroundColor: Colors.sleep.accent }]} />
              <Text style={styles.stageName}>REM</Text>
              <Text style={styles.stagePct}>{remPct}%</Text>
            </View>
            <View style={styles.stageItem}>
              <View style={[styles.stageDot, { backgroundColor: '#4A90E2' }]} />
              <Text style={styles.stageName}>Deep</Text>
              <Text style={styles.stagePct}>{deepPct}%</Text>
            </View>
            <View style={styles.stageItem}>
              <View style={[styles.stageDot, { backgroundColor: Colors.sleep.border }]} />
              <Text style={styles.stageName}>Light</Text>
              <Text style={styles.stagePct}>{lightPct}%</Text>
            </View>
          </View>
          {/* Stage bar */}
          <View style={styles.stageBar}>
            <View style={{ flex: remPct,   backgroundColor: Colors.sleep.accent, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />
            <View style={{ flex: deepPct,  backgroundColor: '#4A90E2' }} />
            <View style={{ flex: lightPct, backgroundColor: Colors.sleep.border, borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
          </View>
        </View>

        {/* Mood picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How do you feel?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.moodBtn,
                  selectedMood === m && { backgroundColor: Colors.sleep.bg, borderColor: Colors.sleep.border },
                ]}
                onPress={() => setSelectedMood(m)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28 }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>vs your goal</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Target: {formatDurationLong(targetMin)}</Text>
            <Text style={[styles.goalDiff, { color: scoreColor }]}>
              {entry.durationMin >= targetMin
                ? `+${formatDurationLong(entry.durationMin - targetMin)}`
                : `-${formatDurationLong(targetMin - entry.durationMin)}`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: progress, backgroundColor: scoreColor }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: Colors.sleep.accent }]}
          onPress={handleStartDay}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaTxt}>Start my day →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40, alignItems: 'center', gap: 16 },
  hero: { alignItems: 'center', paddingTop: 8 },
  greeting: { fontSize: 18, fontWeight: '600', color: Colors.sub, marginBottom: 8 },
  duration: { fontSize: 48, fontWeight: '900', color: Colors.sleep.accent, letterSpacing: -1 },
  durationSub: { fontSize: 14, color: Colors.sub, marginTop: 4 },
  ringWrap: { position: 'relative', width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  scoreNum: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  scoreSub: { fontSize: 13, color: Colors.sub, marginTop: -2 },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  statChip: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border, padding: 14, alignItems: 'center',
  },
  statNum: { fontSize: 17, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.sub, marginTop: 3, fontWeight: '600' },
  card: {
    width: '100%', backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, padding: 16,
  },
  cardTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.sub,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  stageRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  stageItem: { alignItems: 'center', gap: 4 },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageName: { fontSize: 12, color: Colors.sub, fontWeight: '600' },
  stagePct: { fontSize: 15, fontWeight: '800', color: Colors.text },
  stageBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalLabel: { fontSize: 14, color: Colors.sub, fontWeight: '500' },
  goalDiff: { fontSize: 15, fontWeight: '800' },
  progressTrack: { flexDirection: 'row', height: 8, borderRadius: 4, backgroundColor: Colors.bg, overflow: 'hidden' },
  progressFill: { borderRadius: 4 },
  ctaBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 4,
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
