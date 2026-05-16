import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Dark } from '../src/colors';
import { useBlockStore } from '../src/store/useBlockStore';
import { Domain } from '../src/types';

const DOMAIN_OPTIONS: { label: string; value: Domain; icon: string; accent: string; fill: string }[] = [
  { label: 'Study',    value: 'study',    icon: '📚', accent: '#E8604C', fill: 'rgba(232,96,76,0.15)' },
  { label: 'Schedule', value: 'schedule', icon: '📅', accent: '#F5A623', fill: 'rgba(245,166,35,0.15)' },
  { label: 'Sleep',    value: 'sleep',    icon: '🌙', accent: '#9B8FE0', fill: 'rgba(155,143,224,0.15)' },
];

const ICON_OPTIONS = ['📐', '🔬', '🌍', '💻', '📖', '✏️', '🏋️', '🏃', '🍱', '☕', '🧘', '🎵', '🌙', '💤', '📅', '🛒', '💊', '🎯'];

const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 6);

function fmtTime(h: number, m: number) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hd = h % 12 === 0 ? 12 : h % 12;
  return `${hd}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function AddBlockScreen() {
  const router = useRouter();
  const addBlock = useBlockStore((s) => s.addBlock);
  const params = useLocalSearchParams<{ presetHour?: string; presetMin?: string }>();

  const presetH = params.presetHour ? parseInt(params.presetHour, 10) : 9;
  const presetM = params.presetMin  ? parseInt(params.presetMin,  10) : 0;

  const [title, setTitle]       = useState('');
  const [domain, setDomain]     = useState<Domain>('study');
  const [icon, setIcon]         = useState('📖');
  const [startHour, setStartHour] = useState(presetH);
  const [startMin, setStartMin]   = useState(presetM);
  const [durationMin, setDuration] = useState(60);
  const [note, setNote]         = useState('');

  const domainMeta = DOMAIN_OPTIONS.find((d) => d.value === domain) ?? DOMAIN_OPTIONS[0]!;

  function handleAdd() {
    if (!title.trim()) return;
    addBlock({ title: title.trim(), domain, icon, startHour, startMin, durationMin, note: note.trim() || undefined });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>New Block</Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: domainMeta.accent }]}
            activeOpacity={0.8}
          >
            <Text style={styles.addTxt}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Calculus, Morning Run…"
            placeholderTextColor={Dark.sub}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="next"
          />

          {/* Domain */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.domainRow}>
            {DOMAIN_OPTIONS.map((opt) => {
              const active = domain === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.domainChip,
                    {
                      borderColor: active ? opt.accent : Dark.border,
                      backgroundColor: active ? opt.fill : Dark.block,
                    },
                  ]}
                  onPress={() => { setDomain(opt.value); setIcon(opt.icon); }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16 }}>{opt.icon}</Text>
                  <Text style={[styles.domainLabel, { color: active ? opt.accent : Dark.sub }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Icon */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                style={[
                  styles.iconChip,
                  icon === ic && { backgroundColor: domainMeta.fill, borderColor: domainMeta.accent },
                ]}
                onPress={() => setIcon(ic)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Start time */}
          <Text style={styles.label}>Start time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourScroll}>
            {HOUR_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.hourChip,
                  startHour === h && { backgroundColor: domainMeta.fill, borderColor: domainMeta.accent },
                ]}
                onPress={() => setStartHour(h)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.hourTxt,
                    startHour === h && { color: domainMeta.accent, fontWeight: '700' },
                  ]}
                >
                  {fmtTime(h, 0)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minutes */}
          <View style={styles.minRow}>
            {[0, 15, 30, 45].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.minChip,
                  startMin === m && { backgroundColor: domainMeta.fill, borderColor: domainMeta.accent },
                ]}
                onPress={() => setStartMin(m)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.minTxt,
                    startMin === m && { color: domainMeta.accent, fontWeight: '700' },
                  ]}
                >
                  :{m.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durRow}>
            {[15, 30, 45, 60, 90, 120, 180, 240].map((d) => {
              const lbl = d < 60 ? `${d}m` : d % 60 === 0 ? `${d / 60}h` : `${Math.floor(d / 60)}h ${d % 60}m`;
              return (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durChip,
                    durationMin === d && { backgroundColor: domainMeta.fill, borderColor: domainMeta.accent },
                  ]}
                  onPress={() => setDuration(d)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.durTxt,
                      durationMin === d && { color: domainMeta.accent, fontWeight: '700' },
                    ]}
                  >
                    {lbl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note */}
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Any notes…"
            placeholderTextColor={Dark.sub}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Preview */}
          <View style={[styles.preview, { borderColor: domainMeta.accent }]}>
            <View style={[styles.previewBar, { backgroundColor: domainMeta.accent }]} />
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{title || 'Block title'}</Text>
              <Text style={[styles.previewMeta, { color: domainMeta.accent }]}>
                {fmtTime(startHour, startMin)}{'  ·  '}
                {durationMin < 60 ? `${durationMin}m` : durationMin % 60 === 0 ? `${durationMin / 60}h` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`}
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Dark.surface },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Dark.border,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Dark.border,
  },
  cancel: { fontSize: 15, color: Dark.sub, fontWeight: '500', width: 54 },
  heading: { fontSize: 16, fontWeight: '700', color: Dark.text },
  addBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  label: {
    fontSize: 11, fontWeight: '700', color: Dark.sub,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 4,
  },
  input: {
    backgroundColor: Dark.bg, borderRadius: 12, borderWidth: 1,
    borderColor: Dark.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Dark.text,
  },
  noteInput: { height: 80 },
  domainRow: { flexDirection: 'row', gap: 8 },
  domainChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  domainLabel: { fontSize: 13, fontWeight: '600' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconChip: {
    width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Dark.border, backgroundColor: Dark.block,
  },
  hourScroll: { marginBottom: 4 },
  hourChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Dark.border, backgroundColor: Dark.block, marginRight: 8,
  },
  hourTxt: { fontSize: 13, color: Dark.sub },
  minRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  minChip: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Dark.border, backgroundColor: Dark.block,
  },
  minTxt: { fontSize: 13, color: Dark.sub },
  durRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Dark.border, backgroundColor: Dark.block,
  },
  durTxt: { fontSize: 13, color: Dark.sub },
  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Dark.block, borderRadius: 14, borderWidth: 1,
    padding: 14, marginTop: 12, overflow: 'hidden',
  },
  previewBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
  },
  previewTitle: { fontSize: 15, fontWeight: '700', color: Dark.text },
  previewMeta: { fontSize: 12, marginTop: 2 },
});
