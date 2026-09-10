import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}
