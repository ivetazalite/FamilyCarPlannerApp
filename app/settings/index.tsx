import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { ShieldOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { TimezonePicker } from '@/components/TimezonePicker';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFamily } from '@/contexts/FamilyContext';
import { useUpdateFamilySettings } from '@/hooks/useFamilySettings';

export default function SettingsScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const { settings } = useFamily();
  const { mutateAsync: updateSettings } = useUpdateFamilySettings();

  const [timezone, setTimezone] = useState(settings.timezone);
  const [vehicleName, setVehicleName] = useState(settings.vehicleName);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleNameFocused, setVehicleNameFocused] = useState(false);

  useEffect(() => {
    setTimezone(settings.timezone);
    setVehicleName(settings.vehicleName);
  }, [settings]);

  const isAdmin = currentUser?.role === 'ADMIN';

  async function handleSave() {
    console.log('[Settings] Save settings pressed:', { timezone, vehicleName });
    setIsSaving(true);
    try {
      await updateSettings({ timezone, vehicleName: vehicleName.trim() });
      console.log('[Settings] Settings saved successfully');
      Alert.alert('Saved', 'Family settings have been updated.');
    } catch (e) {
      console.error('[Settings] Save settings failed:', e);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Stack.Screen options={{ title: 'Family Settings' }} />
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: COLORS.dangerMuted,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <ShieldOff size={32} color={COLORS.danger} />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: COLORS.text,
            fontFamily: 'SpaceGrotesk-Bold',
            textAlign: 'center',
          }}
        >
          Access denied
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: COLORS.textSecondary,
            fontFamily: 'SpaceGrotesk-Regular',
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          Only family admins can change these settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen options={{ title: 'Family Settings' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
          gap: 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Vehicle name */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 20,
            gap: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            boxShadow: `0 1px 4px ${COLORS.shadow}`,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-SemiBold',
              }}
            >
              Vehicle
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              The name shown throughout the app
            </Text>
          </View>

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
              Vehicle name
            </Text>
            <TextInput
              value={vehicleName}
              onChangeText={setVehicleName}
              placeholder="e.g. Kia e-Niro"
              placeholderTextColor={COLORS.textTertiary}
              onFocus={() => setVehicleNameFocused(true)}
              onBlur={() => setVehicleNameFocused(false)}
              style={{
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 14,
                fontSize: 15,
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-Regular',
                borderWidth: 1.5,
                borderColor: vehicleNameFocused ? COLORS.primary : COLORS.border,
              }}
            />
          </View>
        </View>

        {/* Timezone */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 20,
            gap: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            boxShadow: `0 1px 4px ${COLORS.shadow}`,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-SemiBold',
              }}
            >
              Timezone
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              All reservation times are displayed in this timezone
            </Text>
          </View>

          <TimezonePicker
            value={timezone}
            onChange={(tz) => {
              console.log('[Settings] Timezone changed to:', tz);
              setTimezone(tz);
            }}
          />
        </View>

        {/* Save button */}
        <AnimatedPressable
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          accessibilityLabel="Save settings"
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
            {isSaving ? 'Saving…' : 'Save settings'}
          </Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
