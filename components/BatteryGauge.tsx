import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { Zap } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

interface BatteryGaugeProps {
  percent: number;
  isCharging: boolean;
  width?: number;
  height?: number;
}

function getBatteryColor(percent: number): string {
  if (percent > 50) return '#10B981';
  if (percent > 20) return '#F59E0B';
  return '#EF4444';
}

export function BatteryGauge({
  percent,
  isCharging,
  width = 280,
  height = 80,
}: BatteryGaugeProps) {
  const COLORS = useColors();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const clampedPercent = Math.max(0, Math.min(100, percent));
  const batteryColor = getBatteryColor(clampedPercent);
  const terminalWidth = 12;
  const terminalHeight = 28;
  const bodyWidth = width - terminalWidth - 4;
  const bodyHeight = height;
  const innerPadding = 4;
  const maxFillWidth = bodyWidth - innerPadding * 2;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: (clampedPercent / 100) * maxFillWidth,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPercent, maxFillWidth]);

  useEffect(() => {
    if (isCharging) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => { pulse.stop(); };
    } else {
      pulseAnim.setValue(1);
      return undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCharging]);

  const percentDisplay = Math.round(clampedPercent);

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <View style={{ position: 'relative', width: width, height: bodyHeight }}>
        <Svg width={width} height={bodyHeight}>
          {/* Battery body outline */}
          <Rect
            x={0}
            y={0}
            width={bodyWidth}
            height={bodyHeight}
            rx={12}
            ry={12}
            fill="none"
            stroke={COLORS.border}
            strokeWidth={2}
          />
          {/* Terminal nub */}
          <Rect
            x={bodyWidth + 4}
            y={(bodyHeight - terminalHeight) / 2}
            width={terminalWidth}
            height={terminalHeight}
            rx={4}
            ry={4}
            fill={COLORS.surfaceSecondary}
          />
        </Svg>

        {/* Animated fill */}
        <Animated.View
          style={{
            position: 'absolute',
            left: innerPadding,
            top: innerPadding,
            height: bodyHeight - innerPadding * 2,
            width: animatedWidth,
            backgroundColor: batteryColor,
            borderRadius: 8,
            opacity: 0.9,
          }}
        />

        {/* Percentage text */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: terminalWidth + 4,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: clampedPercent > 30 ? '#FFFFFF' : COLORS.text,
              fontFamily: 'SpaceGrotesk-Bold',
              fontVariant: ['tabular-nums'],
            }}
          >
            {percentDisplay}%
          </Text>
        </View>

        {/* Charging bolt */}
        {isCharging && (
          <Animated.View
            style={{
              position: 'absolute',
              right: terminalWidth + 20,
              top: 8,
              opacity: pulseAnim,
            }}
          >
            <Zap size={20} color="#F59E0B" fill="#F59E0B" />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
