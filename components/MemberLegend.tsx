import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MemberAvatar } from './MemberAvatar';
import type { User } from '@/types';

interface MemberLegendProps {
  members: User[];
}

export function MemberLegend({ members }: MemberLegendProps) {
  const COLORS = useColors();

  if (!members.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingVertical: 8 }}
    >
      {members.map((member) => (
        <View
          key={member.id}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <MemberAvatar name={member.name} color={member.color} size={24} />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              fontFamily: 'SpaceGrotesk-Medium',
              fontWeight: '500',
            }}
          >
            {member.name.split(' ')[0]}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
