import type { ImageGenRequest, ImageGenResponse } from './types'

export async function generateImage(
  request: ImageGenRequest,
  group: string,
  apiKey: string
): Promise<ImageGenResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
  if (group && group !== 'auto') {
    headers['X-New-Api-Group'] = group
  }

  const res = await fetch('/v1/images/generations', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }

  return data
}
