import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../src/colors';
import { useBlockStore } from '../src/store/useBlockStore';
import { formatTime, formatDuration } from '../src/utils/time';

export default function BlockDetailScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId: string }>();

  const blocks = useBlockStore((s) => s.blocks);
  const updateBlock = useBlockStore((s) => s.updateBlock);
  const removeBlock = useBlockStore((s) => s.removeBlock);
  const completeBlock = useBlockStore((s) => s.completeBlock);

  const block = blocks.find((b) => b.id === blockId);

  const [title, setTitle] = useState(block?.title ?? '');
  const [note, setNote]   = useState(block?.note ?? '');

  if (!block) return null;

  const bid = block.id;
  const domainColors = Colors[block.domain];
  const isCompleted = Boolean(block.completedAt);

  function handleSave() {
    if (!title.trim()) return;
    updateBlock(bid, { title: title.trim(), note: note.trim() || undefined });
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete block', `Remove "${block?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { removeBlock(bid); router.back(); },
      },
    ]);
  }

  function handleComplete() {
    completeBlock(bid);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.handle} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: domainColors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={{ fontSize: 22 }}>{block.icon}</Text>
          <Text style={styles.heading} numberOfLines={1}>{block.title}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
          <Text style={[styles.save, { color: domainColors.accent }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Time info */}
        <View style={[styles.infoCard, { backgroundColor: domainColors.bg, borderColor: domainColors.border }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start</Text>
            <Text style={[styles.infoValue, { color: domainColors.text }]}>
              {formatTime(block.startHour, block.startMin)}
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: domainColors.border }]} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={[styles.infoValue, { color: domainColors.text }]}>
              {formatDuration(block.durationMin)}
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: domainColors.border }]} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={[styles.infoValue, { color: domainColors.text, textTransform: 'capitalize' }]}>
              {block.domain}
            </Text>
          </View>
          {isCompleted && (
            <>
              <View style={[styles.infoDivider, { backgroundColor: domainColors.border }]} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: Colors.schedule.accent }]}>✓ Completed</Text>
              </View>
            </>
          )}
        </View>

        {/* Edit title */}
        <Text style={styles.fieldLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={Colors.sub}
          returnKeyType="done"
        />

        {/* Note */}
        <Text style={styles.fieldLabel}>Note</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Add a note…"
          placeholderTextColor={Colors.sub}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Actions */}
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.schedule.bg, borderColor: Colors.schedule.border }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionTxt, { color: Colors.schedule.text }]}>✓ Mark as complete</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFF0F0', borderColor: '#FFCACA', marginTop: 8 }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionTxt, { color: '#C0392B' }]}>Delete block</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  cancel: { fontSize: 15, color: Colors.sub, fontWeight: '500', width: 54 },
  heading: { fontSize: 16, fontWeight: '700', color: Colors.text, flexShrink: 1 },
  save: { fontSize: 15, fontWeight: '700', width: 54, textAlign: 'right' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  infoCard: {
    borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  infoLabel: { fontSize: 14, color: Colors.sub, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  infoDivider: { height: 1, marginHorizontal: 16 },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.sub,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.bg, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.border, padding: 12, fontSize: 15, color: Colors.text,
  },
  noteInput: { height: 100 },
  actionBtn: {
    borderRadius: 12, borderWidth: 1.5, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  actionTxt: { fontSize: 14, fontWeight: '700' },
});
