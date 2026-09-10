export const queryKeys = {
  reservations: {
    all: ['reservations'] as const,
    list: () => [...queryKeys.reservations.all, 'list'] as const,
    week: (weekStart: string) => [...queryKeys.reservations.all, 'week', weekStart] as const,
    detail: (id: string) => [...queryKeys.reservations.all, 'detail', id] as const,
  },
  vehicle: {
    status: ['vehicle', 'status'] as const,
  },
  family: {
    members: ['family', 'members'] as const,
    settings: ['family', 'settings'] as const,
  },
  user: {
    me: ['user', 'me'] as const,
  },
};
