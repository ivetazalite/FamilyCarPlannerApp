import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RefreshCw, Zap, AlertTriangle, Wifi, WifiOff } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { BatteryGauge } from './BatteryGauge';
import { VehicleStatusSkeleton } from './SkeletonLoader';
import { toRelativeTime } from '@/utils/timezone';
import type { VehicleStatus } from '@/types';

interface VehicleStatusCardProps {
  status: VehicleStatus | null;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}

export function VehicleStatusCard({
  status,
  isLoading,
  isError,
  onRefresh,
}: VehicleStatusCardProps) {
  const COLORS = useColors();

  if (isLoading) {
    return <VehicleStatusSkeleton />;
  }

  if (isError || !status) {
    return (
      <View
        style={{
          margin: 20,
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          gap: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
          boxShadow: `0 2px 8px ${COLORS.shadow}`,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: COLORS.dangerMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff size={28} color={COLORS.danger} />
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-SemiBold',
            }}
          >
            Connection error
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              textAlign: 'center',
              fontFamily: 'SpaceGrotesk-Regular',
            }}
          >
            Could not reach the vehicle. Check your connection.
          </Text>
        </View>
        <AnimatedPressable
          onPress={() => {
            console.log('[VehicleStatusCard] Retry pressed');
            onRefresh();
          }}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '600',
              fontFamily: 'SpaceGrotesk-SemiBold',
            }}
          >
            Try again
          </Text>
        </AnimatedPressable>
      </View>
    );
  }

  const lastUpdatedText = toRelativeTime(status.lastUpdated);
  const isLive = status.dataSource === 'official';

  return (
    <View style={{ gap: 16, padding: 20 }}>
      {/* Stale data warning */}
      {status.isStale && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: COLORS.warningMuted,
            borderRadius: 10,
            padding: 12,
            borderWidth: 1,
            borderColor: COLORS.warning + '40',
          }}
        >
          <AlertTriangle size={16} color={COLORS.warning} />
          <Text
            style={{
              fontSize: 13,
              color: COLORS.warning,
              fontFamily: 'SpaceGrotesk-Medium',
              fontWeight: '500',
              flex: 1,
            }}
          >
            Data may be outdated — vehicle hasn't reported recently
          </Text>
        </View>
      )}

      {/* Main battery card */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: COLORS.border,
          boxShadow: `0 2px 12px ${COLORS.shadow}`,
          gap: 20,
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <View style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-Bold',
              }}
            >
              Battery Status
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              Updated {lastUpdatedText}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {status.isCharging && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: COLORS.warningMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Zap size={12} color={COLORS.warning} fill={COLORS.warning} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: COLORS.warning,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  Charging
                </Text>
              </View>
            )}
            <AnimatedPressable
              onPress={() => {
                console.log('[VehicleStatusCard] Manual refresh pressed');
                onRefresh();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Refresh vehicle status"
              accessibilityRole="button"
            >
              <RefreshCw size={16} color={COLORS.primary} />
            </AnimatedPressable>
          </View>
        </View>

        {/* Battery gauge */}
        <BatteryGauge
          percent={status.batteryPercent}
          isCharging={status.isCharging}
          width={280}
          height={80}
        />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.background,
              borderRadius: 12,
              padding: 14,
              gap: 4,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Est. Range
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-Bold',
                fontVariant: ['tabular-nums'],
              }}
            >
              {status.estimatedRangeKm}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: COLORS.textSecondary,
                }}
              >
                {' '}km
              </Text>
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.background,
              borderRadius: 12,
              padding: 14,
              gap: 4,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Data Source
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {isLive ? (
                <Wifi size={16} color={COLORS.success} />
              ) : (
                <WifiOff size={16} color={COLORS.textSecondary} />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isLive ? COLORS.success : COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                {isLive ? 'Live data' : 'Mock data'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Kia e-Niro silhouette */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: COLORS.border,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <CarSilhouette color={COLORS.textTertiary} />
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            fontFamily: 'SpaceGrotesk-Medium',
            fontWeight: '500',
          }}
        >
          Kia e-Niro
        </Text>
      </View>
    </View>
  );
}

function CarSilhouette({ color }: { color: string }) {
  return (
    <View style={{ width: 200, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={200} height={80} viewBox="0 0 200 80">
        <Path
          d="M20 55 L20 45 Q22 38 35 32 L60 25 Q75 18 100 18 Q125 18 140 25 L165 32 Q178 38 180 45 L180 55 Q180 62 175 62 L165 62 Q163 68 155 68 Q147 68 145 62 L55 62 Q53 68 45 68 Q37 68 35 62 L25 62 Q20 62 20 55 Z"
          fill={color}
          opacity={0.4}
        />
        <Path
          d="M60 32 L75 22 Q90 16 100 16 Q110 16 125 22 L140 32 Z"
          fill={color}
          opacity={0.25}
        />
      </Svg>
    </View>
  );
}
