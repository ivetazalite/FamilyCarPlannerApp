import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ReservationCard } from '@/components/ReservationCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ReservationCardSkeleton } from '@/components/SkeletonLoader';
import { useReservations } from '@/hooks/useReservations';
import { useFamily } from '@/contexts/FamilyContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Reservation } from '@/types';

type FilterTab = 'all' | 'mine' | 'upcoming' | 'past';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export default function ReservationsScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = useFamily();
  const currentUser = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const { data: reservations = [], isLoading, isError, refetch, isFetching } = useReservations();

  const filtered = useMemo(() => {
    const now = new Date();
    let list = [...reservations].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    switch (activeFilter) {
      case 'mine':
        list = list.filter((r) => r.userId === currentUser?.id);
        break;
      case 'upcoming':
        list = list.filter(
          (r) => r.status === 'ACTIVE' && new Date(r.startTime) >= now
        );
        break;
      case 'past':
        list = list.filter((r) => new Date(r.endTime) < now);
        break;
      default:
        break;
    }
    return list;
  }, [reservations, activeFilter, currentUser]);

  const handleReservationPress = useCallback(
    (reservation: Reservation) => {
      console.log('[ReservationsScreen] Reservation pressed:', reservation.id);
      router.push(`/reservation/${reservation.id}`);
    },
    [router]
  );

  const handleFilterChange = useCallback((filter: FilterTab) => {
    console.log('[ReservationsScreen] Filter changed to:', filter);
    setActiveFilter(filter);
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('[ReservationsScreen] Pull-to-refresh triggered');
    refetch();
  }, [refetch]);

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
        <ErrorState
          title="Couldn't load reservations"
          message="Check your connection and try again."
          onRetry={() => {
            console.log('[ReservationsScreen] Retry pressed');
            refetch();
          }}
        />
      </View>
    );
  }

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
          gap: 12,
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
          Bookings
        </Text>

        {/* Filter tabs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleFilterChange(tab.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? COLORS.primary : COLORS.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: isActive ? COLORS.primary : COLORS.border,
                }}
                accessibilityLabel={`Filter: ${tab.label}`}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#FFFFFF' : COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ padding: 20, gap: 0 }}>
          {[...Array(5)].map((_, i) => (
            <ReservationCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ReservationCard
              reservation={item}
              timezone={settings.timezone}
              onPress={handleReservationPress}
              index={index}
            />
          )}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 120,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Calendar}
              title="No reservations"
              subtitle={
                activeFilter === 'mine'
                  ? "You haven't made any bookings yet"
                  : activeFilter === 'upcoming'
                  ? 'No upcoming bookings scheduled'
                  : 'No reservations found'
              }
              ctaLabel="Book the car"
              onCta={() => {
                console.log('[ReservationsScreen] Empty state CTA pressed');
                router.push('/reservation/new');
              }}
            />
          }
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
    </View>
  );
}
