import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Dark } from '../../src/colors';

function TabIcon({ label, focused, children }: { label: string; focused: boolean; children: string }) {
  return (
    <View style={styles.item}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{children}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Today" focused={focused}>📅</TabIcon>,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Week" focused={focused}>🗓️</TabIcon>,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Stats" focused={focused}>📊</TabIcon>,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Goals" focused={focused}>🎯</TabIcon>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Dark.surface,
    borderTopColor: Dark.border,
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 20,
    opacity: 0.35,
  },
  emojiFocused: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: Dark.sub,
    fontWeight: '500',
  },
  labelFocused: {
    color: Dark.accent,
    fontWeight: '700',
  },
});
