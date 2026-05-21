/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchTokenKey, getApiKeys, searchApiKeys, createApiKey } from '@/features/keys/api'
import { API_KEY_STATUS } from '@/features/keys/constants'

export type ActiveChatKeyResult = {
  key: string
  /** true when the key was just auto-created (did not exist before this call) */
  isNewlyCreated: boolean
}

/**
 * Fetch (or auto-create) a dedicated API key for a specific chat preset.
 *
 * When `dedicatedKeyName` is provided the function:
 *   1. Searches for an existing key with that exact name.
 *   2. If found and enabled  → uses it.
 *   3. If found but disabled/expired/exhausted → throws so the user knows
 *      they need to re-enable it manually (we never silently override their intent).
 *   4. If not found → auto-creates one with that name (unlimited quota, no expiry).
 *
 * When `dedicatedKeyName` is omitted the legacy behaviour is preserved:
 *   pick the first enabled key in the list.
 */
export async function fetchActiveChatKey(dedicatedKeyName?: string): Promise<ActiveChatKeyResult> {
  if (dedicatedKeyName) {
    // --- Dedicated-key path ---
    const searchResult = await searchApiKeys({ keyword: dedicatedKeyName, p: 1, size: 10 })
    if (!searchResult.success) {
      throw new Error(searchResult.message || 'Failed to search API keys')
    }

    const items = searchResult.data?.items ?? []
    // Exact-name match (search returns LIKE results, so filter precisely)
    const existing = items.find((item) => item.name === dedicatedKeyName)

    if (existing) {
      if (existing.status !== API_KEY_STATUS.ENABLED) {
        throw new Error(
          `The API key "${dedicatedKeyName}" exists but is disabled or expired. Please re-enable it in your API Keys page.`
        )
      }
      const keyResult = await fetchTokenKey(existing.id)
      if (!keyResult.success || !keyResult.data?.key) {
        throw new Error(keyResult.message || 'Failed to load API key')
      }
      return { key: `sk-${keyResult.data.key}`, isNewlyCreated: false }
    }

    // Not found — auto-create a dedicated key for this preset
    const createResult = await createApiKey({
      name: dedicatedKeyName,
      remain_quota: 0,
      expired_time: -1,
      unlimited_quota: true,
      model_limits_enabled: false,
      model_limits: '',
      allow_ips: '',
      group: 'image2-图片生成',
      cross_group_retry: false,
    })
    if (!createResult.success) {
      throw new Error(createResult.message || `Failed to auto-create API key "${dedicatedKeyName}"`)
    }

    // Re-search to get the newly created key's ID
    const refreshResult = await searchApiKeys({ keyword: dedicatedKeyName, p: 1, size: 10 })
    if (!refreshResult.success) {
      throw new Error(refreshResult.message || 'Failed to reload API keys after creation')
    }
    const created = (refreshResult.data?.items ?? []).find((item) => item.name === dedicatedKeyName)
    if (!created) {
      throw new Error(`Failed to locate the newly created API key "${dedicatedKeyName}"`)
    }

    const keyResult = await fetchTokenKey(created.id)
    if (!keyResult.success || !keyResult.data?.key) {
      throw new Error(keyResult.message || 'Failed to load API key')
    }
    return { key: `sk-${keyResult.data.key}`, isNewlyCreated: true }
  }

  // --- Legacy path: pick the first enabled key ---
  const result = await getApiKeys({ p: 1, size: 50 })
  if (!result.success) {
    throw new Error(result.message || 'Failed to load API keys')
  }

  const items = result.data?.items ?? []
  const active = items.find((item) => item.status === API_KEY_STATUS.ENABLED)
  if (!active) {
    throw new Error('No enabled API keys found. Create or enable one first.')
  }

  const keyResult = await fetchTokenKey(active.id)
  if (!keyResult.success || !keyResult.data?.key) {
    throw new Error(keyResult.message || 'Failed to load API key')
  }

  return { key: `sk-${keyResult.data.key}`, isNewlyCreated: false }
}

/**
 * Get the API key for a chat link.
 *
 * Pass `dedicatedKeyName` (typically the preset's display name) to use a
 * preset-specific key instead of the user's first enabled key.
 */
export function useActiveChatKey(enabled: boolean, dedicatedKeyName?: string) {
  const userId = useAuthStore((state) => state.auth.user?.id)

  return useQuery({
    queryKey: ['chat-active-key', userId, dedicatedKeyName ?? '__any__'],
    queryFn: () => fetchActiveChatKey(dedicatedKeyName),
    enabled: enabled && Boolean(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
