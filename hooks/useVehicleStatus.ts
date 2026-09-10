import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { queryKeys } from '@/utils/queryKeys';
import type { VehicleStatus } from '@/types';

export function useVehicleStatus() {
  return useQuery({
    queryKey: queryKeys.vehicle.status,
    queryFn: async () => {
      console.log('[useVehicleStatus] Fetching vehicle status');
      const { data } = await api.get<VehicleStatus>('/api/vehicle/status');
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}
