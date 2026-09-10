import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { queryKeys } from '@/utils/queryKeys';
import type { Reservation } from '@/types';

export function useReservations() {
  return useQuery({
    queryKey: queryKeys.reservations.list(),
    queryFn: async () => {
      console.log('[useReservations] Fetching all reservations');
      const { data } = await api.get<{ reservations: Reservation[] }>('/api/reservations');
      return data.reservations;
    },
    staleTime: 30_000,
  });
}

export function useWeekReservations(weekStart: string) {
  return useQuery({
    queryKey: queryKeys.reservations.week(weekStart),
    queryFn: async () => {
      console.log('[useWeekReservations] Fetching reservations for week:', weekStart);
      const { data } = await api.get<{ reservations: Reservation[] }>('/api/reservations', {
        params: { weekStart },
      });
      return data.reservations;
    },
    staleTime: 30_000,
    enabled: !!weekStart,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(id),
    queryFn: async () => {
      console.log('[useReservation] Fetching reservation:', id);
      const { data } = await api.get<Reservation>(`/api/reservations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export interface CreateReservationData {
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
  reminderAt?: string;
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReservationData) => {
      console.log('[useCreateReservation] Creating reservation:', data.title);
      const res = await api.post<Reservation>('/api/reservations', data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log('[useCreateReservation] Created reservation:', data.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
    },
  });
}

export function useUpdateReservation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CreateReservationData>) => {
      console.log('[useUpdateReservation] Updating reservation:', id);
      const res = await api.patch<Reservation>(`/api/reservations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      console.log('[useUpdateReservation] Updated reservation:', id);
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.detail(id) });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[useCancelReservation] Cancelling reservation:', id);
      await api.delete(`/api/reservations/${id}`);
      return id;
    },
    onSuccess: (id) => {
      console.log('[useCancelReservation] Cancelled reservation:', id);
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
    },
  });
}
