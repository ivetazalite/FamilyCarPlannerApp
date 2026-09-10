import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLine({
  width = '100%',
  height = 14,
  borderRadius,
  style,
}: SkeletonLineProps) {
  const COLORS = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const widthStyle = typeof width === 'number' ? width : undefined;
  const widthPercent = typeof width === 'string' ? (width as `${number}%`) : undefined;

  return (
    <Animated.View
      style={[
        {
          width: widthStyle ?? widthPercent ?? '100%',
          height,
          borderRadius: borderRadius ?? height / 2,
          backgroundColor: COLORS.surfaceSecondary,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ReservationCardSkeleton() {
  const COLORS = useColors();
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <SkeletonLine width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonLine width="60%" height={14} />
          <SkeletonLine width="40%" height={12} />
        </View>
      </View>
      <SkeletonLine width="80%" height={12} />
    </View>
  );
}

export function VehicleStatusSkeleton() {
  const COLORS = useColors();
  return (
    <View style={{ gap: 20, padding: 20 }}>
      <SkeletonLine width="50%" height={24} />
      <SkeletonLine width="100%" height={80} borderRadius={12} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SkeletonLine width="45%" height={60} borderRadius={12} />
        <SkeletonLine width="45%" height={60} borderRadius={12} />
      </View>
      <SkeletonLine width="60%" height={14} />
    </View>
  );
}
