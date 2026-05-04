import { api, getCommonHeaders } from '@/lib/api'
import type { ImageGenRequest, ImageGenResponse } from './types'

export async function generateImage(
  request: ImageGenRequest,
  group: string
): Promise<ImageGenResponse> {
  const headers: Record<string, string> = {
    ...getCommonHeaders(),
  }
  if (group && group !== 'auto') {
    headers['X-New-Api-Group'] = group
  }

  const res = await api.post('/v1/images/generations', request, {
    headers,
    skipErrorHandler: true,
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}
