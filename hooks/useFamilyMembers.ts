import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { queryKeys } from '@/utils/queryKeys';
import type { User } from '@/types';

export function useFamilyMembers() {
  return useQuery({
    queryKey: queryKeys.family.members,
    queryFn: async () => {
      console.log('[useFamilyMembers] Fetching family members from /api/users');
      const { data } = await api.get<{ users: User[] }>('/api/users');
      return data.users;
    },
    staleTime: 60_000,
  });
}
