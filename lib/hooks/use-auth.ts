import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/appwrite';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}