import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Reservation, User } from '@/types';

export interface CreateReservationData {
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
  reminderAt?: string;
}

interface ReservationsContextValue {
  reservations: Reservation[];
  createReservation: (data: CreateReservationData) => Reservation;
  updateReservation: (id: string, data: Partial<CreateReservationData>) => void;
  cancelReservation: (id: string) => void;
  getReservation: (id: string) => Reservation | undefined;
}

const MOCK_KARLIS: User = {
  id: 'mock-1',
  name: 'Kārlis',
  email: 'karlis@family.com',
  color: '#3B82F6',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const MOCK_GIRTS: User = {
  id: 'mock-2',
  name: 'Ģirts',
  email: 'girts@family.com',
  color: '#10B981',
  role: 'member',
  createdAt: new Date().toISOString(),
};

const MOCK_GUSTAVS: User = {
  id: 'mock-3',
  name: 'Gustavs',
  email: 'gustavs@family.com',
  color: '#F59E0B',
  role: 'member',
  createdAt: new Date().toISOString(),
};

const MOCK_IVETA: User = {
  id: 'mock-4',
  name: 'Iveta',
  email: 'iveta@family.com',
  color: '#EF4444',
  role: 'member',
  createdAt: new Date().toISOString(),
};

function makeSeedReservations(): Reservation[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function dayOffset(days: number, hour: number, minute = 0): string {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  return [
    {
      id: 'seed-1',
      userId: 'mock-1',
      user: MOCK_KARLIS,
      title: 'Bērnu skola',
      startTime: dayOffset(0, 8, 0),
      endTime: dayOffset(0, 9, 0),
      notes: 'Atvest bērnus uz skolu',
      status: 'ACTIVE',
      createdAt: dayOffset(-1, 10),
    },
    {
      id: 'seed-2',
      userId: 'mock-2',
      user: MOCK_GIRTS,
      title: 'Lielveikals',
      startTime: dayOffset(1, 10, 30),
      endTime: dayOffset(1, 12, 0),
      notes: 'Rimi un Maxima',
      status: 'ACTIVE',
      createdAt: dayOffset(-1, 11),
    },
    {
      id: 'seed-3',
      userId: 'mock-3',
      user: MOCK_GUSTAVS,
      title: 'Sporta zāle',
      startTime: dayOffset(2, 7, 0),
      endTime: dayOffset(2, 8, 30),
      status: 'ACTIVE',
      createdAt: dayOffset(-1, 12),
    },
    {
      id: 'seed-4',
      userId: 'mock-4',
      user: MOCK_IVETA,
      title: 'Lidostas brauciens',
      startTime: dayOffset(3, 15, 0),
      endTime: dayOffset(3, 17, 0),
      notes: 'Rīgas lidosta, reiss RIX1234',
      status: 'ACTIVE',
      createdAt: dayOffset(-1, 13),
    },
    {
      id: 'seed-5',
      userId: 'mock-1',
      user: MOCK_KARLIS,
      title: 'Ārsta apmeklējums',
      startTime: dayOffset(4, 11, 0),
      endTime: dayOffset(4, 12, 0),
      notes: 'Poliklīnika',
      status: 'ACTIVE',
      createdAt: dayOffset(-1, 14),
    },
  ];
}

const ReservationsContext = createContext<ReservationsContextValue | null>(null);

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(makeSeedReservations);

  const createReservation = useCallback((data: CreateReservationData): Reservation => {
    const newReservation: Reservation = {
      id: Math.random().toString(36).slice(2),
      userId: MOCK_KARLIS.id,
      user: MOCK_KARLIS,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
      reminderAt: data.reminderAt,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    console.log('[ReservationsContext] createReservation:', newReservation.id, newReservation.title);
    setReservations(prev => [newReservation, ...prev]);
    return newReservation;
  }, []);

  const updateReservation = useCallback((id: string, data: Partial<CreateReservationData>) => {
    console.log('[ReservationsContext] updateReservation:', id, data);
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, ...data } : r))
    );
  }, []);

  const cancelReservation = useCallback((id: string) => {
    console.log('[ReservationsContext] cancelReservation:', id);
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
    );
  }, []);

  const getReservation = useCallback(
    (id: string) => reservations.find(r => r.id === id),
    [reservations]
  );

  return (
    <ReservationsContext.Provider
      value={{ reservations, createReservation, updateReservation, cancelReservation, getReservation }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservationsContext(): ReservationsContextValue {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error('useReservationsContext must be used within ReservationsProvider');
  return ctx;
}
