import type { SystemStatus } from '@/features/auth/types'

/**
 * Extract server address from SystemStatus object
 * Priority: status.server_address > status.serverAddress > status.data.server_address > window.location.origin
 */
export function extractServerAddress(status: SystemStatus | null): string {
  const fromStatus =
    (status?.server_address as string | undefined) ??
    (status?.serverAddress as string | undefined) ??
    status?.data?.server_address ??
    (status?.data as Record<string, unknown> | undefined)?.serverAddress

  if (typeof fromStatus === 'string' && fromStatus.trim()) {
    return fromStatus.trim()
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

/**
 * Normalize API URL by removing trailing slashes
 */
export function normalizeApiUrl(url: string): string {
  return url.replace(/\/+$/, '')
}
