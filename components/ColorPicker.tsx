import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { PRESET_COLORS } from '@/utils/colors';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  label?: string;
}

export function ColorPicker({ selectedColor, onSelect, label = 'Choose color' }: ColorPickerProps) {
  const COLORS = useColors();

  return (
    <View style={{ gap: 8 }}>
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
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <AnimatedPressable
              key={color}
              onPress={() => {
                console.log('[ColorPicker] Color selected:', color);
                onSelect(color);
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: isSelected ? 3 : 0,
                borderColor: COLORS.surface,
                boxShadow: isSelected ? `0 0 0 2px ${color}` : undefined,
              }}
              accessibilityLabel={`Select color ${color}`}
              accessibilityRole="button"
            >
              {isSelected && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
