import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { VehicleStatusCard } from '@/components/VehicleStatusCard';
import { useVehicleStatus } from '@/hooks/useVehicleStatus';
import { useFamily } from '@/contexts/FamilyContext';

export default function VehicleScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const { settings } = useFamily();

  const { data: status, isLoading, isError, refetch, isFetching } = useVehicleStatus();

  const handleRefresh = useCallback(() => {
    console.log('[VehicleScreen] Manual refresh triggered');
    refetch();
  }, [refetch]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: COLORS.surface,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: COLORS.text,
            fontFamily: 'SpaceGrotesk-Bold',
            letterSpacing: -0.3,
          }}
        >
          {settings.vehicleName}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            fontFamily: 'SpaceGrotesk-Regular',
            marginTop: 2,
          }}
        >
          Live vehicle status · auto-refreshes every 60s
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentInsetAdjustmentBehavior="automatic"
      >
        <VehicleStatusCard
          status={status ?? null}
          isLoading={isLoading}
          isError={isError}
          onRefresh={handleRefresh}
        />
      </ScrollView>
    </View>
  );
}
