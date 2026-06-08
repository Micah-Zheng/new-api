import { useQuery } from '@tanstack/react-query'
import { testUrlLatency } from '@/features/dashboard/lib/api-info'

export function useApiUrlPing(url: string, autoStart = true) {
  return useQuery({
    queryKey: ['api-url-ping', url],
    queryFn: () => testUrlLatency(url),
    staleTime: 30000, // 30 seconds cache
    gcTime: 60000,
    enabled: autoStart, // auto-start by default
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
