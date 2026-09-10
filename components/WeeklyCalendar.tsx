import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { ReservationBlock } from './ReservationBlock';
import { SkeletonLine } from './SkeletonLoader';
import {
  SLOT_START_HOUR,
  SLOT_END_HOUR,
  SLOT_HEIGHT,
  SLOT_DURATION_MINUTES,
  COLUMN_WIDTH,
  generateTimeSlots,
  formatSlotTime,
  getWeekDays,
  getReservationsForDay,
  getSlotTopOffset,
  getSlotHeight,
  detectOverlaps,
  slotDateFromDayAndTime,
} from '@/utils/dateHelpers';
import { format } from 'date-fns/format';
import { isToday } from 'date-fns/isToday';
import { toZonedTime } from 'date-fns-tz';
import type { Reservation } from '@/types';

interface WeeklyCalendarProps {
  weekStart: Date;
  reservations: Reservation[];
  timezone: string;
  onSlotPress: (date: Date) => void;
  onReservationPress: (reservation: Reservation) => void;
  isLoading: boolean;
}

const TIME_LABEL_WIDTH = 52;
const TOTAL_SLOTS =
  ((SLOT_END_HOUR - SLOT_START_HOUR) * 60) / SLOT_DURATION_MINUTES;
const GRID_HEIGHT = (TOTAL_SLOTS + 1) * SLOT_HEIGHT;

export function WeeklyCalendar({
  weekStart,
  reservations,
  timezone,
  onSlotPress,
  onReservationPress,
  isLoading,
}: WeeklyCalendarProps) {
  const COLORS = useColors();
  const timeSlots = generateTimeSlots();
  const weekDays = getWeekDays(weekStart);
  const verticalScrollRef = useRef<ScrollView>(null);
  const [currentTimeTop, setCurrentTimeTop] = useState(0);
  const [showCurrentTime, setShowCurrentTime] = useState(false);

  // Scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours >= SLOT_START_HOUR && hours < SLOT_END_HOUR) {
      const offset =
        ((hours - SLOT_START_HOUR) * 60 + minutes) / SLOT_DURATION_MINUTES * SLOT_HEIGHT;
      setTimeout(() => {
        verticalScrollRef.current?.scrollTo({ y: Math.max(0, offset - 100), animated: true });
      }, 300);
    }
  }, []);

  // Update current time indicator every minute
  useEffect(() => {
    function updateTime() {
      const now = toZonedTime(new Date(), timezone);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (hours >= SLOT_START_HOUR && hours < SLOT_END_HOUR) {
        const top =
          ((hours - SLOT_START_HOUR) * 60 + minutes) / SLOT_DURATION_MINUTES * SLOT_HEIGHT;
        setCurrentTimeTop(top);
        setShowCurrentTime(true);
      } else {
        setShowCurrentTime(false);
      }
    }
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonLine key={i} width="100%" height={48} borderRadius={8} />
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      ref={verticalScrollRef}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {/* Time labels column + day columns */}
        <View style={{ flexDirection: 'row' }}>
          {/* Time labels */}
          <View style={{ width: TIME_LABEL_WIDTH }}>
            {/* Header spacer */}
            <View style={{ height: 48 }} />
            {timeSlots.map((slot, i) => {
              const isHour = slot.getMinutes() === 0;
              return (
                <View
                  key={i}
                  style={{
                    height: SLOT_HEIGHT,
                    justifyContent: 'flex-start',
                    paddingTop: 4,
                    paddingRight: 8,
                    alignItems: 'flex-end',
                  }}
                >
                  {isHour && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.textTertiary,
                        fontFamily: 'SpaceGrotesk-Regular',
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {formatSlotTime(slot)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayReservations = getReservationsForDay(reservations, day, timezone);
            const overlapMap = detectOverlaps(dayReservations);
            const isCurrentDay = isToday(day);
            const dayLabel = format(day, 'EEE');
            const dayNum = format(day, 'd');

            return (
              <View
                key={dayIndex}
                style={{ width: COLUMN_WIDTH, borderLeftWidth: 1, borderLeftColor: COLORS.divider }}
              >
                {/* Day header */}
                <View
                  style={{
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                    backgroundColor: isCurrentDay ? COLORS.primaryMuted : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: isCurrentDay ? COLORS.primary : COLORS.textSecondary,
                      fontFamily: 'SpaceGrotesk-SemiBold',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {dayLabel}
                  </Text>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: isCurrentDay ? COLORS.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: isCurrentDay ? '#FFFFFF' : COLORS.text,
                        fontFamily: 'SpaceGrotesk-Bold',
                      }}
                    >
                      {dayNum}
                    </Text>
                  </View>
                </View>

                {/* Time slots grid */}
                <View style={{ height: GRID_HEIGHT, position: 'relative' }}>
                  {/* Slot tap targets */}
                  {timeSlots.map((slot, slotIndex) => {
                    const slotDate = slotDateFromDayAndTime(
                      day,
                      slot.getHours(),
                      slot.getMinutes()
                    );
                    return (
                      <AnimatedPressable
                        key={slotIndex}
                        onPress={() => {
                          console.log('[WeeklyCalendar] Slot pressed:', slotDate.toISOString());
                          onSlotPress(slotDate);
                        }}
                        style={{
                          height: SLOT_HEIGHT,
                          borderBottomWidth: slot.getMinutes() === 0 ? 1 : 0,
                          borderBottomColor: COLORS.divider,
                          backgroundColor: 'transparent',
                        }}
                        accessibilityLabel={`Book slot ${formatSlotTime(slot)} on ${dayLabel} ${dayNum}`}
                        accessibilityRole="button"
                      />
                    );
                  })}

                  {/* Reservation blocks */}
                  {dayReservations.map((res) => {
                    const top = getSlotTopOffset(res.startTime, timezone);
                    const height = getSlotHeight(res.startTime, res.endTime);
                    const overlap = overlapMap.get(res.id) ?? { index: 0, total: 1 };
                    return (
                      <ReservationBlock
                        key={res.id}
                        reservation={res}
                        top={top}
                        height={height}
                        columnWidth={COLUMN_WIDTH}
                        overlapIndex={overlap.index}
                        overlapTotal={overlap.total}
                        onPress={onReservationPress}
                      />
                    );
                  })}

                  {/* Current time indicator */}
                  {showCurrentTime && isCurrentDay && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: currentTimeTop,
                        height: 2,
                        backgroundColor: '#EF4444',
                        zIndex: 10,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          left: -4,
                          top: -4,
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#EF4444',
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
