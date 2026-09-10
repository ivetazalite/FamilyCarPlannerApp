import React from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import type { TabBarItem } from '@/components/FloatingTabBar';

const TABS: TabBarItem[] = [
  {
    name: '(home)',
    route: '/(tabs)/(home)',
    icon: 'calendar-month',
    label: 'Calendar',
  },
  {
    name: 'reservations',
    route: '/(tabs)/reservations',
    icon: 'list-alt',
    label: 'Bookings',
  },
  {
    name: 'vehicle',
    route: '/(tabs)/vehicle',
    icon: 'electric-car',
    label: 'Vehicle',
  },
  {
    name: 'profile',
    route: '/(tabs)/profile',
    icon: 'person',
    label: 'Profile',
  },
];

export default function TabLayout() {
  const pathname = usePathname();
  const hideTabBar =
    pathname.includes('/reservation/') ||
    pathname.includes('/settings/');

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="reservations" />
        <Stack.Screen name="vehicle" />
        <Stack.Screen name="profile" />
      </Stack>
      {!hideTabBar && (
        <FloatingTabBar
          tabs={TABS}
          containerWidth={320}
          borderRadius={35}
          bottomMargin={20}
        />
      )}
    </View>
  );
}
