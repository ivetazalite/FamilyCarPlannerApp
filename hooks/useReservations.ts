import type { Reservation } from '@/types';
import { useReservationsContext, type CreateReservationData } from '@/contexts/ReservationsContext';
import { addDays, parseISO } from 'date-fns';

export type { CreateReservationData };

export function useReservations() {
  const { reservations } = useReservationsContext();
  console.log('[useReservations] Returning', reservations.length, 'local reservations');
  return {
    data: reservations,
    isLoading: false as const,
    isError: false as const,
    isFetching: false as const,
    refetch: () => {
      console.log('[useReservations] refetch called (no-op in local mode)');
    },
  };
}

export function useWeekReservations(weekStart: string) {
  const { reservations } = useReservationsContext();
  const start = weekStart ? parseISO(weekStart) : null;
  const end = start ? addDays(start, 7) : null;
  const filtered = start && end
    ? reservations.filter(r => {
        const t = parseISO(r.startTime);
        return t >= start && t < end;
      })
    : reservations;
  console.log('[useWeekReservations] week:', weekStart, '→', filtered.length, 'reservations');
  return { data: filtered, isLoading: false as const, isError: false as const };
}

export function useReservation(id: string) {
  const { getReservation } = useReservationsContext();
  const reservation = getReservation(id);
  console.log('[useReservation] id:', id, '→', reservation ? reservation.title : 'not found');
  return {
    data: reservation as Reservation | undefined,
    isLoading: false as const,
    isError: !reservation,
  };
}

export function useCreateReservation() {
  const { createReservation } = useReservationsContext();
  return {
    mutateAsync: (data: CreateReservationData): Promise<Reservation> => {
      console.log('[useCreateReservation] mutateAsync:', data.title);
      const result = createReservation(data);
      return Promise.resolve(result);
    },
  };
}

export function useUpdateReservation(id: string) {
  const { updateReservation } = useReservationsContext();
  return {
    mutateAsync: (data: Partial<CreateReservationData>): Promise<void> => {
      console.log('[useUpdateReservation] mutateAsync id:', id);
      updateReservation(id, data);
      return Promise.resolve();
    },
  };
}

export function useCancelReservation() {
  const { cancelReservation } = useReservationsContext();
  return {
    mutateAsync: (id: string): Promise<void> => {
      console.log('[useCancelReservation] mutateAsync id:', id);
      cancelReservation(id);
      return Promise.resolve();
    },
  };
}
