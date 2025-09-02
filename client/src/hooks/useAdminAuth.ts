import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminAuthResponse {
  isAdmin: boolean;
  user: any;
}

export function useAdminAuth() {
  const { data, isLoading, error } = useQuery<AdminAuthResponse>({
    queryKey: ["/api/auth/admin"],
    queryFn: () => apiRequest("GET", "/api/auth/admin").then(res => res.json()),
    retry: false, // Don't retry if admin check fails
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isAdmin: data?.isAdmin || false,
    adminUser: data?.user,
    isLoading,
    error,
    isAuthenticated: !!data?.isAdmin,
  };
}