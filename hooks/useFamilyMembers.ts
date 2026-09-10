import type { User } from '@/types';

const FAMILY_MEMBERS: User[] = [
  {
    id: 'mock-1',
    name: 'Kārlis',
    email: 'karlis@family.com',
    color: '#3B82F6',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Ģirts',
    email: 'girts@family.com',
    color: '#10B981',
    role: 'member',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Gustavs',
    email: 'gustavs@family.com',
    color: '#F59E0B',
    role: 'member',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    name: 'Iveta',
    email: 'iveta@family.com',
    color: '#EF4444',
    role: 'member',
    createdAt: new Date().toISOString(),
  },
];

export function useFamilyMembers() {
  console.log('[useFamilyMembers] Returning static family members list');
  return {
    data: FAMILY_MEMBERS,
    isLoading: false,
    isError: false,
  };
}
