import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Search, X, ChevronDown, Check } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { IANA_TIMEZONES } from '@/utils/timezone';

interface TimezonePickerProps {
  value: string;
  onChange: (tz: string) => void;
  label?: string;
}

export function TimezonePicker({ value, onChange, label = 'Timezone' }: TimezonePickerProps) {
  const COLORS = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return IANA_TIMEZONES;
    const q = search.toLowerCase();
    return IANA_TIMEZONES.filter((tz) => tz.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
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
          {label}
        </Text>
        <AnimatedPressable
          onPress={() => {
            console.log('[TimezonePicker] Opening picker');
            setModalVisible(true);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.surfaceSecondary,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          accessibilityLabel="Select timezone"
          accessibilityRole="button"
        >
          <Text
            style={{
              fontSize: 15,
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Regular',
              flex: 1,
            }}
          >
            {value || 'Select timezone'}
          </Text>
          <ChevronDown size={18} color={COLORS.textSecondary} />
        </AnimatedPressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-SemiBold',
              }}
            >
              Select Timezone
            </Text>
            <AnimatedPressable
              onPress={() => setModalVisible(false)}
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

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              margin: 16,
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 10,
              paddingHorizontal: 12,
              gap: 8,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Search size={16} color={COLORS.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search timezones..."
              placeholderTextColor={COLORS.textTertiary}
              style={{
                flex: 1,
                fontSize: 15,
                color: COLORS.text,
                paddingVertical: 12,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    console.log('[TimezonePicker] Selected timezone:', item);
                    onChange(item);
                    setModalVisible(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.divider,
                    backgroundColor: isSelected ? COLORS.primaryMuted : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: isSelected ? COLORS.primary : COLORS.text,
                      fontFamily: isSelected ? 'SpaceGrotesk-SemiBold' : 'SpaceGrotesk-Regular',
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {item}
                  </Text>
                  {isSelected && <Check size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            }}
            contentInsetAdjustmentBehavior="automatic"
          />
        </View>
      </Modal>
    </>
  );
}
