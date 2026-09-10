import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, LogOut, ChevronRight, Edit2, Check, X } from 'lucide-react-native';
import type { User } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { MemberAvatar } from '@/components/MemberAvatar';
import { ColorPicker } from '@/components/ColorPicker';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

export default function ProfileScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { data: members = [] } = useFamilyMembers();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editColor, setEditColor] = useState(user?.color ?? '#3B82F6');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditToggle = useCallback(() => {
    console.log('[ProfileScreen] Edit toggle pressed');
    if (isEditing) {
      setEditName(user?.name ?? '');
      setEditColor(user?.color ?? '#3B82F6');
    }
    setIsEditing((v) => !v);
  }, [isEditing, user]);

  const handleSave = useCallback(async () => {
    console.log('[ProfileScreen] Save profile pressed');
    setIsSaving(true);
    try {
      await updateProfile({ name: editName.trim(), color: editColor });
      setIsEditing(false);
      console.log('[ProfileScreen] Profile saved successfully');
    } catch (e) {
      console.error('[ProfileScreen] Save profile failed:', e);
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editName, editColor, updateProfile]);

  const handleSwitchMember = useCallback((member: User) => {
    if (member.id === user?.id) return;
    console.log('[ProfileScreen] Switch member pressed:', member.name, member.id);
    updateProfile({
      id: member.id,
      name: member.name,
      email: member.email,
      color: member.color,
      role: member.role,
    });
  }, [user, updateProfile]);

  const handleLogout = useCallback(() => {
    console.log('[ProfileScreen] Sign out pressed');
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          console.log('[ProfileScreen] Sign out confirmed');
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [logout, router]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const displayName = isEditing ? editName : user.name;
  const displayColor = isEditing ? editColor : user.color;

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          Profile
        </Text>
        <AnimatedPressable
          onPress={handleEditToggle}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isEditing ? COLORS.dangerMuted : COLORS.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit profile'}
          accessibilityRole="button"
        >
          {isEditing ? (
            <X size={18} color={COLORS.danger} />
          ) : (
            <Edit2 size={18} color={COLORS.primary} />
          )}
        </AnimatedPressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 120,
          gap: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Avatar + name card */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            gap: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            boxShadow: `0 2px 8px ${COLORS.shadow}`,
          }}
        >
          <MemberAvatar name={displayName || user.name} color={displayColor} size={80} />

          {isEditing ? (
            <View style={{ width: '100%', gap: 12 }}>
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
                  Name
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
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
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>
              <ColorPicker
                selectedColor={editColor}
                onSelect={setEditColor}
                label="Member color"
              />
              <AnimatedPressable
                onPress={handleSave}
                disabled={isSaving}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
                accessibilityLabel="Save profile"
                accessibilityRole="button"
              >
                <Check size={16} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Text>
              </AnimatedPressable>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-Bold',
                }}
              >
                {user.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
                selectable
              >
                {user.email}
              </Text>
              <View
                style={{
                  backgroundColor: COLORS.primaryMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: COLORS.primary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  {user.role}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Family members */}
        {members.length > 0 && (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: 'hidden',
              boxShadow: `0 1px 4px ${COLORS.shadow}`,
            }}
          >
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                Family Members
              </Text>
            </View>
            {members.map((member, index) => {
              const isActive = member.id === user.id;
              const memberNameSuffix = isActive ? ' (you)' : '';
              return (
                <AnimatedPressable
                  key={member.id}
                  onPress={() => handleSwitchMember(member)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    gap: 12,
                    borderBottomWidth: index < members.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.divider,
                    backgroundColor: isActive ? COLORS.primaryMuted : 'transparent',
                  }}
                  accessibilityLabel={isActive ? member.name + ' (active)' : 'Switch to ' + member.name}
                  accessibilityRole="button"
                >
                  <MemberAvatar name={member.name} color={member.color} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: COLORS.text,
                        fontFamily: 'SpaceGrotesk-SemiBold',
                      }}
                    >
                      {member.name}
                      {memberNameSuffix}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.textSecondary,
                        fontFamily: 'SpaceGrotesk-Regular',
                      }}
                    >
                      {member.role}
                    </Text>
                  </View>
                  {isActive ? (
                    <Check size={16} color={COLORS.primary} />
                  ) : (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: member.color,
                      }}
                    />
                  )}
                </AnimatedPressable>
              );
            })}
          </View>
        )}

        {/* Admin section */}
        {isAdmin && (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: 'hidden',
              boxShadow: `0 1px 4px ${COLORS.shadow}`,
            }}
          >
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                Admin
              </Text>
            </View>
            <AnimatedPressable
              onPress={() => {
                console.log('[ProfileScreen] Navigate to family settings');
                router.push('/settings' as never);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
              }}
              accessibilityLabel="Family settings"
              accessibilityRole="button"
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: COLORS.primaryMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={18} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: COLORS.text,
                  fontFamily: 'SpaceGrotesk-Medium',
                  fontWeight: '500',
                }}
              >
                Family settings
              </Text>
              <ChevronRight size={18} color={COLORS.textSecondary} />
            </AnimatedPressable>
          </View>
        )}

        {/* Sign out */}
        <AnimatedPressable
          onPress={handleLogout}
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
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <LogOut size={18} color={COLORS.danger} />
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: COLORS.danger,
              fontFamily: 'SpaceGrotesk-SemiBold',
            }}
          >
            Sign out
          </Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
