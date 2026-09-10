import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Clock, FileText } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { MemberAvatar } from './MemberAvatar';
import { toDisplayTime, toDisplayTimeOnly } from '@/utils/timezone';
import type { Reservation } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  timezone: string;
  onPress: (reservation: Reservation) => void;
  index?: number;
}

export function ReservationCard({
  reservation,
  timezone,
  onPress,
  index = 0,
}: ReservationCardProps) {
  const COLORS = useColors();
  const memberColor = reservation.user?.color ?? COLORS.primary;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateDisplay = toDisplayTime(reservation.startTime, timezone);
  const startTimeDisplay = toDisplayTimeOnly(reservation.startTime, timezone);
  const endTimeDisplay = toDisplayTimeOnly(reservation.endTime, timezone);
  const timeRange = `${startTimeDisplay} – ${endTimeDisplay}`;
  const isCancelled = reservation.status === 'CANCELLED';

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable
        onPress={() => {
          console.log('[ReservationCard] Pressed:', reservation.id, reservation.title);
          onPress(reservation);
        }}
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
          flexDirection: 'row',
          boxShadow: `0 1px 4px ${COLORS.shadow}`,
          opacity: isCancelled ? 0.5 : 1,
        }}
        accessibilityLabel={`Reservation: ${reservation.title}`}
        accessibilityRole="button"
      >
        {/* Color left border */}
        <View
          style={{
            width: 4,
            backgroundColor: memberColor,
          }}
        />

        <View style={{ flex: 1, padding: 14, gap: 8 }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MemberAvatar
              name={reservation.user?.name ?? '?'}
              color={memberColor}
              size={32}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
                numberOfLines={1}
              >
                {reservation.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              >
                {reservation.user?.name ?? 'Unknown'}
              </Text>
            </View>
            {isCancelled && (
              <View
                style={{
                  backgroundColor: COLORS.dangerMuted,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: COLORS.danger,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  Cancelled
                </Text>
              </View>
            )}
          </View>

          {/* Date/time row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color={COLORS.textSecondary} />
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              {dateDisplay}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textTertiary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              · {timeRange}
            </Text>
          </View>

          {/* Notes */}
          {reservation.notes ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
              <FileText size={13} color={COLORS.textTertiary} style={{ marginTop: 1 }} />
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textTertiary,
                  fontFamily: 'SpaceGrotesk-Regular',
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {reservation.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
