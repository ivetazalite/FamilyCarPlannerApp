import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from './AnimatedPressable';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Couldn't load data",
  message = 'Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
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
          backgroundColor: COLORS.dangerMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={32} color={COLORS.danger} strokeWidth={1.5} />
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
          {message}
        </Text>
      </View>
      {onRetry && (
        <AnimatedPressable
          onPress={() => {
            console.log('[ErrorState] Retry pressed');
            onRetry();
          }}
          style={{
            backgroundColor: COLORS.danger,
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
            Try again
          </Text>
        </AnimatedPressable>
      )}
    </View>
  );
}
