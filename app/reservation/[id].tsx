import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Pencil, Check, X, Trash2, AlertCircle, Clock, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useReservation, useUpdateReservation, useCancelReservation } from '@/hooks/useReservations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFamily } from '@/contexts/FamilyContext';
import { toDisplayDate, toDisplayTimeOnly } from '@/utils/timezone';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addHours } from 'date-fns/addHours';
import { format } from 'date-fns/format';

export default function ReservationDetailScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useFamily();
  const currentUser = useCurrentUser();

  const { data: reservation, isLoading, isError } = useReservation(id);
  const { mutateAsync: updateReservation } = useUpdateReservation(id);
  const { mutateAsync: cancelReservation } = useCancelReservation();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStartDate, setEditStartDate] = useState(new Date());
  const [editEndDate, setEditEndDate] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    reservation &&
    (reservation.userId === currentUser?.id || currentUser?.role === 'ADMIN') &&
    reservation.status === 'ACTIVE';

  function startEditing() {
    if (!reservation) return;
    console.log('[ReservationDetail] Edit mode activated for:', reservation.id);
    setEditTitle(reservation.title);
    setEditNotes(reservation.notes ?? '');
    setEditStartDate(toZonedTime(new Date(reservation.startTime), settings.timezone));
    setEditEndDate(toZonedTime(new Date(reservation.endTime), settings.timezone));
    setIsEditing(true);
  }

  function cancelEditing() {
    console.log('[ReservationDetail] Edit cancelled');
    setIsEditing(false);
    setError('');
  }

  const handleSave = useCallback(async () => {
    console.log('[ReservationDetail] Save changes pressed');
    if (!editTitle.trim()) {
      setError('Title is required.');
      return;
    }
    if (editEndDate <= editStartDate) {
      setError('End time must be after start time.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const utcStart = fromZonedTime(editStartDate, settings.timezone);
      const utcEnd = fromZonedTime(editEndDate, settings.timezone);
      await updateReservation({
        title: editTitle.trim(),
        notes: editNotes.trim() || undefined,
        startTime: utcStart.toISOString(),
        endTime: utcEnd.toISOString(),
      });
      setIsEditing(false);
      console.log('[ReservationDetail] Reservation updated successfully');
    } catch (e: unknown) {
      console.error('[ReservationDetail] Update failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not save changes. Please try again.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [editTitle, editNotes, editStartDate, editEndDate, settings.timezone, updateReservation]);

  const handleCancel = useCallback(() => {
    console.log('[ReservationDetail] Cancel reservation pressed');
    Alert.alert(
      'Cancel reservation',
      'This will cancel the booking. This action cannot be undone.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel reservation',
          style: 'destructive',
          onPress: async () => {
            console.log('[ReservationDetail] Cancel confirmed for:', id);
            try {
              await cancelReservation(id);
              router.back();
            } catch (e) {
              console.error('[ReservationDetail] Cancel failed:', e);
              Alert.alert('Error', 'Could not cancel reservation. Please try again.');
            }
          },
        },
      ]
    );
  }, [id, cancelReservation, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 20, gap: 16 }}>
        <Stack.Screen options={{ title: 'Reservation' }} />
        {[...Array(4)].map((_, i) => (
          <View
            key={i}
            style={{
              height: 60,
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 12,
              opacity: 0.5,
            }}
          />
        ))}
      </View>
    );
  }

  if (isError || !reservation) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Stack.Screen options={{ title: 'Reservation' }} />
        <AlertCircle size={40} color={COLORS.danger} />
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: COLORS.text,
            marginTop: 16,
            fontFamily: 'SpaceGrotesk-SemiBold',
          }}
        >
          Reservation not found
        </Text>
        <AnimatedPressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'SpaceGrotesk-SemiBold' }}>
            Go back
          </Text>
        </AnimatedPressable>
      </View>
    );
  }

  const memberColor = reservation.user?.color ?? COLORS.primary;
  const dateDisplay = toDisplayDate(reservation.startTime, settings.timezone);
  const startTimeDisplay = toDisplayTimeOnly(reservation.startTime, settings.timezone);
  const endTimeDisplay = toDisplayTimeOnly(reservation.endTime, settings.timezone);
  const isCancelled = reservation.status === 'CANCELLED';

  const editStartTimeDisplay = format(editStartDate, 'HH:mm');
  const editEndTimeDisplay = format(editEndDate, 'HH:mm');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: reservation.title,
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () =>
            canEdit && !isEditing ? (
              <TouchableOpacity
                onPress={startEditing}
                style={{ padding: 8 }}
                accessibilityLabel="Edit reservation"
              >
                <Pencil size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : isEditing ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={cancelEditing}
                  style={{ padding: 8 }}
                  accessibilityLabel="Cancel editing"
                >
                  <X size={20} color={COLORS.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{ padding: 8 }}
                  accessibilityLabel="Save changes"
                >
                  <Check size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
          gap: 16,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Status badge */}
        {isCancelled && (
          <View
            style={{
              backgroundColor: COLORS.dangerMuted,
              borderRadius: 10,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} color={COLORS.danger} />
            <Text
              style={{
                fontSize: 14,
                color: COLORS.danger,
                fontFamily: 'SpaceGrotesk-Medium',
                fontWeight: '500',
              }}
            >
              This reservation has been cancelled
            </Text>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View
            style={{
              backgroundColor: COLORS.dangerMuted,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: COLORS.danger + '40',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: COLORS.danger,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Main card */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: COLORS.border,
            boxShadow: `0 2px 8px ${COLORS.shadow}`,
          }}
        >
          {/* Color accent top */}
          <View style={{ height: 4, backgroundColor: memberColor }} />

          <View style={{ padding: 20, gap: 16 }}>
            {/* Member info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MemberAvatar
                name={reservation.user?.name ?? '?'}
                color={memberColor}
                size={44}
              />
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: COLORS.text,
                    fontFamily: 'SpaceGrotesk-Bold',
                  }}
                >
                  {reservation.user?.name ?? 'Unknown'}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                >
                  {reservation.user?.email ?? ''}
                </Text>
              </View>
            </View>

            {/* Title */}
            {isEditing ? (
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Title
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={{
                    backgroundColor: COLORS.surfaceSecondary,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: COLORS.text,
                    fontFamily: 'SpaceGrotesk-Regular',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                />
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-Bold',
                  letterSpacing: -0.2,
                }}
              >
                {reservation.title}
              </Text>
            )}

            {/* Date/time */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color={COLORS.textSecondary} />
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                >
                  {dateDisplay}
                </Text>
              </View>

              {isEditing ? (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.textSecondary,
                        fontFamily: 'SpaceGrotesk-SemiBold',
                        fontWeight: '600',
                      }}
                    >
                      Start
                    </Text>
                    <AnimatedPressable
                      onPress={() => {
                        console.log('[ReservationDetail] Edit start time picker opened');
                        setShowStartTime(true);
                      }}
                      style={{
                        backgroundColor: COLORS.surfaceSecondary,
                        borderRadius: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: COLORS.text,
                          fontFamily: 'SpaceGrotesk-Regular',
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {editStartTimeDisplay}
                      </Text>
                    </AnimatedPressable>
                    {showStartTime && (
                      <DateTimePicker
                        value={editStartDate}
                        mode="time"
                        is24Hour
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_, date) => {
                          setShowStartTime(Platform.OS === 'ios');
                          if (date) {
                            setEditStartDate(date);
                            if (date >= editEndDate) setEditEndDate(addHours(date, 1));
                          }
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.textSecondary,
                        fontFamily: 'SpaceGrotesk-SemiBold',
                        fontWeight: '600',
                      }}
                    >
                      End
                    </Text>
                    <AnimatedPressable
                      onPress={() => {
                        console.log('[ReservationDetail] Edit end time picker opened');
                        setShowEndTime(true);
                      }}
                      style={{
                        backgroundColor: COLORS.surfaceSecondary,
                        borderRadius: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: COLORS.text,
                          fontFamily: 'SpaceGrotesk-Regular',
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {editEndTimeDisplay}
                      </Text>
                    </AnimatedPressable>
                    {showEndTime && (
                      <DateTimePicker
                        value={editEndDate}
                        mode="time"
                        is24Hour
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_, date) => {
                          setShowEndTime(Platform.OS === 'ios');
                          if (date) setEditEndDate(date);
                        }}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.text,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    marginLeft: 24,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {startTimeDisplay} – {endTimeDisplay}
                </Text>
              )}
            </View>

            {/* Notes */}
            {isEditing ? (
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Notes
                </Text>
                <TextInput
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{
                    backgroundColor: COLORS.surfaceSecondary,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: COLORS.text,
                    fontFamily: 'SpaceGrotesk-Regular',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    minHeight: 80,
                  }}
                />
              </View>
            ) : reservation.notes ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <FileText size={16} color={COLORS.textSecondary} style={{ marginTop: 2 }} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-Regular',
                    lineHeight: 20,
                  }}
                  selectable
                >
                  {reservation.notes}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Save button (edit mode) */}
        {isEditing && (
          <AnimatedPressable
            onPress={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
            accessibilityLabel="Save changes"
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#FFFFFF',
                fontFamily: 'SpaceGrotesk-Bold',
              }}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Text>
          </AnimatedPressable>
        )}

        {/* Cancel reservation button */}
        {canEdit && !isEditing && (
          <AnimatedPressable
            onPress={handleCancel}
            style={{
              backgroundColor: COLORS.dangerMuted,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: COLORS.danger + '30',
            }}
            accessibilityLabel="Cancel reservation"
            accessibilityRole="button"
          >
            <Trash2 size={18} color={COLORS.danger} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: COLORS.danger,
                fontFamily: 'SpaceGrotesk-SemiBold',
              }}
            >
              Cancel reservation
            </Text>
          </AnimatedPressable>
        )}
      </ScrollView>
    </View>
  );
}
