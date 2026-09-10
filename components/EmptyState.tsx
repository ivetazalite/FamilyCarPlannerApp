import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  const COLORS = useColors();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 16,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: COLORS.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={32} color={COLORS.primary} strokeWidth={1.5} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: COLORS.text,
            textAlign: 'center',
            fontFamily: 'SpaceGrotesk-SemiBold',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: COLORS.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
            fontFamily: 'SpaceGrotesk-Regular',
          }}
        >
          {subtitle}
        </Text>
      </View>
      {ctaLabel && onCta && (
        <AnimatedPressable
          onPress={() => {
            console.log('[EmptyState] CTA pressed:', ctaLabel);
            onCta();
          }}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '600',
              fontFamily: 'SpaceGrotesk-SemiBold',
            }}
          >
            {ctaLabel}
          </Text>
        </AnimatedPressable>
      )}
    </View>
  );
}
