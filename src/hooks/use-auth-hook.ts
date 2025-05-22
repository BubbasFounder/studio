'use client';
import { useAuthContext } from '@/contexts/auth-provider';

export const useAuth = () => {
  return useAuthContext();
};
