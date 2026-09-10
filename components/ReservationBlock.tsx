import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useColors } from '@/hooks/useColors';
import type { Reservation } from '@/types';

interface ReservationBlockProps {
  reservation: Reservation;
  top: number;
  height: number;
  columnWidth: number;
  overlapIndex: number;
  overlapTotal: number;
  onPress: (reservation: Reservation) => void;
}

export function ReservationBlock({
  reservation,
  top,
  height,
  columnWidth,
  overlapIndex,
  overlapTotal,
  onPress,
}: ReservationBlockProps) {
  const COLORS = useColors();
  const memberColor = reservation.user?.color ?? COLORS.primary;
  const blockWidth = columnWidth / overlapTotal - 2;
  const leftOffset = overlapIndex * (columnWidth / overlapTotal) + 1;

  const titleDisplay = reservation.title || 'Reservation';
  const shortTitle = titleDisplay.length > 12 ? titleDisplay.slice(0, 12) + '…' : titleDisplay;

  return (
    <AnimatedPressable
      onPress={() => {
        console.log('[ReservationBlock] Pressed reservation:', reservation.id, reservation.title);
        onPress(reservation);
      }}
      style={{
        position: 'absolute',
        top,
        left: leftOffset,
        width: blockWidth,
        height: Math.max(height - 2, 20),
        backgroundColor: memberColor + 'DD',
        borderRadius: 6,
        padding: 4,
        overflow: 'hidden',
        borderLeftWidth: 3,
        borderLeftColor: memberColor,
      }}
      accessibilityLabel={`Reservation: ${reservation.title}`}
      accessibilityRole="button"
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          color: '#FFFFFF',
          fontFamily: 'SpaceGrotesk-Bold',
          lineHeight: 13,
        }}
        numberOfLines={1}
      >
        {shortTitle}
      </Text>
      {height > 36 && (
        <Text
          style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'SpaceGrotesk-Regular',
            marginTop: 1,
          }}
          numberOfLines={1}
        >
          {reservation.user?.name?.split(' ')[0] ?? ''}
        </Text>
      )}
    </AnimatedPressable>
  );
}
