import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  isAdmin?: boolean;
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthResult => {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user data');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  const logout = async (): Promise<void> => {
    try {
      // Clear all React Query cache
      queryClient.clear();
      // Redirect to logout endpoint which will handle the logout and redirect to home
      window.location.href = '/api/logout';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - redirect to home anyway
      window.location.href = '/';
    }
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout
  };
};
