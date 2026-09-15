import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { VehicleStatusCard } from '@/components/VehicleStatusCard';
import { useVehicleStatus } from '@/hooks/useVehicleStatus';
import { useFamily } from '@/contexts/FamilyContext';
import { useKiaCredentials } from '@/hooks/useKiaCredentials';
import { AnimatedPressable } from '@/components/AnimatedPressable';

export default function VehicleScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const { settings } = useFamily();
  const { data: status, isLoading, isError, refetch, isFetching } = useVehicleStatus();
  const { username, isLoaded, hasCreds, save } = useKiaCredentials();

  const [isEditing, setIsEditing] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleRefresh = useCallback(() => {
    console.log('[VehicleScreen] Manual refresh triggered');
    refetch();
  }, [refetch]);

  const handleOpenEdit = useCallback(() => {
    console.log('[VehicleScreen] "Change credentials" tapped, opening edit form');
    setInputUsername(username ?? '');
    setInputPassword('');
    setShowPassword(false);
    setIsEditing(true);
  }, [username]);

  const handleCancelEdit = useCallback(() => {
    console.log('[VehicleScreen] Credential edit cancelled');
    setIsEditing(false);
    setInputUsername('');
    setInputPassword('');
  }, []);

  const handleConnect = useCallback(async () => {
    if (!inputUsername.trim() || !inputPassword.trim()) {
      console.log('[VehicleScreen] Connect tapped but fields are empty');
      return;
    }
    console.log('[VehicleScreen] Connect button pressed, saving credentials for:', inputUsername.trim());
    setIsSaving(true);
    await save(inputUsername.trim(), inputPassword.trim());
    setIsSaving(false);
    setIsEditing(false);
    setInputUsername('');
    setInputPassword('');
    console.log('[VehicleScreen] Credentials saved, returning to vehicle view');
  }, [inputUsername, inputPassword, save]);

  const handleTogglePassword = useCallback(() => {
    console.log('[VehicleScreen] Password visibility toggled');
    setShowPassword((prev) => !prev);
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // ── Shared header ──────────────────────────────────────────────────────────
  const header = (
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
  );

  // ── Credentials form (shown when !hasCreds OR isEditing) ───────────────────
  if (!hasCreds || isEditing) {
    const isEditMode = hasCreds && isEditing;
    const connectLabel = isSaving ? 'Connecting…' : 'Connect';

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {header}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
            paddingTop: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon area */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Car size={36} color={COLORS.primary} strokeWidth={1.8} />
            </View>
          </View>

          {/* Title + subtitle */}
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'SpaceGrotesk-Bold',
              color: COLORS.text,
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: -0.3,
            }}
          >
            Connect your Kia account
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'SpaceGrotesk-Regular',
              color: COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 32,
              paddingHorizontal: 8,
            }}
          >
            Enter your Kia Connect (UVO) username and password to fetch live vehicle data.
          </Text>

          {/* Card */}
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 20,
              shadowColor: COLORS.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 3,
              gap: 16,
            }}
          >
            {/* Username */}
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                  color: COLORS.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Username
              </Text>
              <TextInput
                value={inputUsername}
                onChangeText={(text) => {
                  console.log('[VehicleScreen] Username field changed');
                  setInputUsername(text);
                }}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: 48,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.surfaceSecondary,
                  paddingHorizontal: 14,
                  fontSize: 15,
                  fontFamily: 'SpaceGrotesk-Regular',
                  color: COLORS.text,
                }}
              />
            </View>

            {/* Password */}
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                  color: COLORS.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={inputPassword}
                  onChangeText={(text) => {
                    console.log('[VehicleScreen] Password field changed');
                    setInputPassword(text);
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    backgroundColor: COLORS.surfaceSecondary,
                    paddingHorizontal: 14,
                    paddingRight: 48,
                    fontSize: 15,
                    fontFamily: 'SpaceGrotesk-Regular',
                    color: COLORS.text,
                  }}
                />
                <AnimatedPressable
                  onPress={handleTogglePassword}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  scaleValue={0.9}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textSecondary} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} color={COLORS.textSecondary} strokeWidth={1.8} />
                  )}
                </AnimatedPressable>
              </View>
            </View>

            {/* Connect button */}
            <AnimatedPressable
              onPress={handleConnect}
              disabled={isSaving || !inputUsername.trim() || !inputPassword.trim()}
              style={{
                height: 50,
                borderRadius: 12,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    color: '#FFFFFF',
                    letterSpacing: 0.2,
                  }}
                >
                  {connectLabel}
                </Text>
              )}
            </AnimatedPressable>
          </View>

          {/* Cancel link (edit mode only) */}
          {isEditMode && (
            <AnimatedPressable
              onPress={handleCancelEdit}
              style={{ alignItems: 'center', marginTop: 20 }}
              scaleValue={0.95}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'SpaceGrotesk-Regular',
                  color: COLORS.textSecondary,
                }}
              >
                Cancel
              </Text>
            </AnimatedPressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Vehicle data view ──────────────────────────────────────────────────────
  const displayUsername = username ?? '';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {header}
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

        {/* Change credentials row */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <AnimatedPressable
            onPress={handleOpenEdit}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
            }}
            scaleValue={0.98}
          >
            <Lock size={18} color={COLORS.textSecondary} strokeWidth={1.8} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'SpaceGrotesk-Regular',
                  color: COLORS.textSecondary,
                }}
              >
                Kia account:
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                  color: COLORS.text,
                  marginTop: 1,
                }}
              >
                {displayUsername}
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.textTertiary} strokeWidth={2} />
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}
