import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { queryKeys } from '@/utils/queryKeys';
import type { FamilySettings } from '@/types';
import { useFamily } from '@/contexts/FamilyContext';
import { useEffect } from 'react';

export function useFamilySettings() {
  const { updateSettings } = useFamily();

  const query = useQuery({
    queryKey: queryKeys.family.settings,
    queryFn: async () => {
      console.log('[useFamilySettings] Fetching family settings');
      const { data } = await api.get<FamilySettings>('/api/family/settings');
      return data;
    },
    staleTime: 120_000,
  });

  useEffect(() => {
    if (query.data) {
      updateSettings(query.data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}

export function useUpdateFamilySettings() {
  const queryClient = useQueryClient();
  const { updateSettings } = useFamily();

  return useMutation({
    mutationFn: async (data: Partial<FamilySettings>) => {
      console.log('[useUpdateFamilySettings] Updating settings:', data);
      const res = await api.patch<FamilySettings>('/api/family/settings', data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log('[useUpdateFamilySettings] Settings updated');
      updateSettings(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.family.settings });
    },
  });
}
