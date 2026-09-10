import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';

const REMINDER_OPTIONS = [
  { label: '5 min before', minutes: 5 },
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
];

interface ReminderPickerProps {
  enabled: boolean;
  minutesBefore: number;
  onToggle: (enabled: boolean) => void;
  onMinutesChange: (minutes: number) => void;
}

export function ReminderPicker({
  enabled,
  minutesBefore,
  onToggle,
  onMinutesChange,
}: ReminderPickerProps) {
  const COLORS = useColors();

  return (
    <View style={{ gap: 12 }}>
      {/* Toggle row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.surfaceSecondary,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Bell size={18} color={COLORS.primary} />
          <Text
            style={{
              fontSize: 15,
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Medium',
              fontWeight: '500',
            }}
          >
            Set reminder
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={(val) => {
            console.log('[ReminderPicker] Toggle reminder:', val);
            onToggle(val);
          }}
          trackColor={{ false: COLORS.surfaceTertiary, true: COLORS.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Options */}
      {enabled && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REMINDER_OPTIONS.map((opt) => {
            const isSelected = minutesBefore === opt.minutes;
            return (
              <AnimatedPressable
                key={opt.minutes}
                onPress={() => {
                  console.log('[ReminderPicker] Selected reminder:', opt.label);
                  onMinutesChange(opt.minutes);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isSelected ? COLORS.primary : COLORS.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: isSelected ? COLORS.primary : COLORS.border,
                }}
                accessibilityLabel={opt.label}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: isSelected ? '#FFFFFF' : COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-Medium',
                  }}
                >
                  {opt.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
