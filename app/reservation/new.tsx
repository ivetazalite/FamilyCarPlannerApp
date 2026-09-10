import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ReminderPicker } from '@/components/ReminderPicker';
import { useCreateReservation } from '@/hooks/useReservations';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addHours } from 'date-fns/addHours';
import { addMinutes } from 'date-fns/addMinutes';
import { format } from 'date-fns/format';

export default function NewReservationScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ startTime?: string }>();
  const { settings } = useFamily();
  const { user } = useAuth();
  const { mutateAsync: createReservation } = useCreateReservation();

  const initialStart = params.startTime
    ? toZonedTime(new Date(params.startTime), settings.timezone)
    : toZonedTime(new Date(), settings.timezone);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(addHours(initialStart, 1));
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  // Date/time picker state
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const startDateDisplay = format(startDate, 'EEE, d MMM yyyy');
  const startTimeDisplay = format(startDate, 'HH:mm');
  const endTimeDisplay = format(endDate, 'HH:mm');

  const handleSave = useCallback(async () => {
    console.log('[NewReservation] Save reservation pressed:', title);
    if (!title.trim()) {
      setError('Please enter a title for this reservation.');
      return;
    }
    if (endDate <= startDate) {
      setError('End time must be after start time.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const utcStart = fromZonedTime(startDate, settings.timezone);
      const utcEnd = fromZonedTime(endDate, settings.timezone);
      const reminderAt = reminderEnabled
        ? addMinutes(utcStart, -reminderMinutes).toISOString()
        : undefined;

      await createReservation({
        title: title.trim(),
        startTime: utcStart.toISOString(),
        endTime: utcEnd.toISOString(),
        notes: notes.trim() || undefined,
        reminderAt,
        userId: user?.id,
        user: user ?? undefined,
      });
      console.log('[NewReservation] Reservation created successfully');
      router.back();
    } catch (e: unknown) {
      console.error('[NewReservation] Create reservation failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not save reservation. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [title, startDate, endDate, notes, reminderEnabled, reminderMinutes, settings.timezone, createReservation, router]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Sheet header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: COLORS.surface,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
            fontFamily: 'SpaceGrotesk-Bold',
          }}
        >
          New booking
        </Text>
        <AnimatedPressable
          onPress={() => {
            console.log('[NewReservation] Close sheet pressed');
            router.back();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <X size={16} color={COLORS.textSecondary} />
        </AnimatedPressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error */}
        {error ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              backgroundColor: COLORS.dangerMuted,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: COLORS.danger + '40',
            }}
          >
            <AlertCircle size={16} color={COLORS.danger} style={{ marginTop: 1 }} />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: COLORS.danger,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Title */}
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
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. School run, Grocery trip"
            placeholderTextColor={COLORS.textTertiary}
            autoFocus
            returnKeyType="next"
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            style={{
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 15,
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Regular',
              borderWidth: 1.5,
              borderColor: titleFocused ? COLORS.primary : COLORS.border,
            }}
          />
        </View>

        {/* Date */}
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
            Date
          </Text>
          <AnimatedPressable
            onPress={() => {
              console.log('[NewReservation] Date picker opened');
              setShowStartDate(true);
            }}
            style={{
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
            accessibilityLabel="Select date"
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 15,
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              {startDateDisplay}
            </Text>
          </AnimatedPressable>
          {showStartDate && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, date) => {
                setShowStartDate(Platform.OS === 'ios');
                if (date) {
                  const newStart = new Date(startDate);
                  newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  const newEnd = new Date(endDate);
                  newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  setStartDate(newStart);
                  setEndDate(newEnd);
                  console.log('[NewReservation] Date changed:', date.toISOString());
                }
              }}
            />
          )}
        </View>

        {/* Time row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Start time */}
          <View style={{ flex: 1, gap: 6 }}>
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
              Start time
            </Text>
            <AnimatedPressable
              onPress={() => {
                console.log('[NewReservation] Start time picker opened');
                setShowStartTime(true);
              }}
              style={{
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              accessibilityLabel="Select start time"
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 15,
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-Regular',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {startTimeDisplay}
              </Text>
            </AnimatedPressable>
            {showStartTime && (
              <DateTimePicker
                value={startDate}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowStartTime(Platform.OS === 'ios');
                  if (date) {
                    setStartDate(date);
                    if (date >= endDate) {
                      setEndDate(addHours(date, 1));
                    }
                    console.log('[NewReservation] Start time changed:', date.toISOString());
                  }
                }}
              />
            )}
          </View>

          {/* End time */}
          <View style={{ flex: 1, gap: 6 }}>
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
              End time
            </Text>
            <AnimatedPressable
              onPress={() => {
                console.log('[NewReservation] End time picker opened');
                setShowEndTime(true);
              }}
              style={{
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              accessibilityLabel="Select end time"
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 15,
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-Regular',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {endTimeDisplay}
              </Text>
            </AnimatedPressable>
            {showEndTime && (
              <DateTimePicker
                value={endDate}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowEndTime(Platform.OS === 'ios');
                  if (date) {
                    setEndDate(date);
                    console.log('[NewReservation] End time changed:', date.toISOString());
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Notes */}
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
            Notes (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any details about this trip..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            onFocus={() => setNotesFocused(true)}
            onBlur={() => setNotesFocused(false)}
            style={{
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Regular',
              borderWidth: 1.5,
              borderColor: notesFocused ? COLORS.primary : COLORS.border,
              minHeight: 80,
            }}
          />
        </View>

        {/* Reminder */}
        <ReminderPicker
          enabled={reminderEnabled}
          minutesBefore={reminderMinutes}
          onToggle={setReminderEnabled}
          onMinutesChange={setReminderMinutes}
        />

        {/* Timezone note */}
        <Text
          style={{
            fontSize: 12,
            color: COLORS.textTertiary,
            fontFamily: 'SpaceGrotesk-Regular',
            textAlign: 'center',
          }}
        >
          Times shown in {settings.timezone}
        </Text>

        {/* Save button */}
        <AnimatedPressable
          onPress={handleSave}
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          accessibilityLabel="Save reservation"
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
            {isLoading ? 'Saving…' : 'Save reservation'}
          </Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
