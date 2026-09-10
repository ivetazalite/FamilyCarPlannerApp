import React from 'react';
import { View, Text } from 'react-native';

interface MemberAvatarProps {
  name: string;
  color: string;
  size?: number;
  fontSize?: number;
}

export function MemberAvatar({ name, color, size = 36, fontSize }: MemberAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const computedFontSize = fontSize ?? Math.floor(size * 0.38);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: computedFontSize,
          fontWeight: '700',
          fontFamily: 'SpaceGrotesk-Bold',
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
