import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { MemberLegend } from '@/components/MemberLegend';
import { useWeekReservations } from '@/hooks/useReservations';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamily } from '@/contexts/FamilyContext';
import {
  getWeekStart,
  getNextWeek,
  getPrevWeek,
  formatWeekRange,
  isCurrentWeek,
} from '@/utils/dateHelpers';
import { format } from 'date-fns/format';
import type { Reservation } from '@/types';

export default function HomeScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = useFamily();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const weekStartParam = format(weekStart, 'yyyy-MM-dd');
  const { data: reservations = [], isLoading } = useWeekReservations(weekStartParam);
  const { data: members = [] } = useFamilyMembers();

  const weekLabel = formatWeekRange(weekStart);
  const isThisWeek = isCurrentWeek(weekStart);

  const handlePrevWeek = useCallback(() => {
    console.log('[HomeScreen] Navigate to previous week');
    setWeekStart((w) => getPrevWeek(w));
  }, []);

  const handleNextWeek = useCallback(() => {
    console.log('[HomeScreen] Navigate to next week');
    setWeekStart((w) => getNextWeek(w));
  }, []);

  const handleToday = useCallback(() => {
    console.log('[HomeScreen] Jump to current week');
    setWeekStart(getWeekStart(new Date()));
  }, []);

  const handleSlotPress = useCallback(
    (date: Date) => {
      console.log('[HomeScreen] Empty slot pressed, navigating to new reservation:', date.toISOString());
      router.push({
        pathname: '/reservation/new',
        params: { startTime: date.toISOString() },
      });
    },
    [router]
  );

  const handleReservationPress = useCallback(
    (reservation: Reservation) => {
      console.log('[HomeScreen] Reservation pressed:', reservation.id);
      router.push(`/reservation/${reservation.id}`);
    },
    [router]
  );

  const handleFABPress = useCallback(() => {
    console.log('[HomeScreen] FAB pressed, navigating to new reservation');
    router.push('/reservation/new');
  }, [router]);

  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          backgroundColor: COLORS.surface,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          gap: 10,
        }}
      >
        {/* Title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Bold',
              letterSpacing: -0.3,
            }}
          >
            Family Car Planner
          </Text>
          {!isThisWeek && (
            <AnimatedPressable
              onPress={handleToday}
              style={{
                backgroundColor: COLORS.accentMuted,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              accessibilityLabel="Jump to today"
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: COLORS.accent,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                Today
              </Text>
            </AnimatedPressable>
          )}
        </View>

        {/* Week navigation */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AnimatedPressable
            onPress={handlePrevWeek}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: COLORS.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Previous week"
            accessibilityRole="button"
          >
            <ChevronLeft size={18} color={COLORS.text} />
          </AnimatedPressable>

          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-SemiBold',
            }}
          >
            {weekLabel}
          </Text>

          <AnimatedPressable
            onPress={handleNextWeek}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: COLORS.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Next week"
            accessibilityRole="button"
          >
            <ChevronRight size={18} color={COLORS.text} />
          </AnimatedPressable>
        </View>

        {/* Member legend */}
        {members.length > 0 && <MemberLegend members={members} />}
      </View>

      {/* Calendar */}
      <WeeklyCalendar
        weekStart={weekStart}
        reservations={activeReservations}
        timezone={settings.timezone}
        onSlotPress={handleSlotPress}
        onReservationPress={handleReservationPress}
        isLoading={isLoading}
      />

      {/* FAB */}
      <AnimatedPressable
        onPress={handleFABPress}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: COLORS.primary,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 16px ${COLORS.primary}60`,
        }}
        accessibilityLabel="Create new reservation"
        accessibilityRole="button"
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </AnimatedPressable>
    </View>
  );
}
