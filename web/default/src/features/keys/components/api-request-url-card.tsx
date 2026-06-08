import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { useStatus } from '@/hooks/use-status'
import { extractServerAddress, normalizeApiUrl } from '@/lib/url-utils'
import { ApiUrlRow } from './api-url-row'
import type { ApiUrlItem } from '../types'

export function ApiRequestUrlCard() {
  const { t } = useTranslation()
  const { status } = useStatus()

  const apiUrls = useMemo<ApiUrlItem[]>(() => {
    const serverUrl = normalizeApiUrl(extractServerAddress(status))

    const allUrls: ApiUrlItem[] = [
      { id: 'cn', label: 'China Node', url: 'https://cn-api.tcp.red' },
      { id: 'global', label: 'Global Node', url: 'https://api.tcp.red' },
      { id: 'cn-v1', label: 'China Node (v1)', url: 'https://cn-api.tcp.red/v1' },
      { id: 'global-v1', label: 'Global Node (v1)', url: 'https://api.tcp.red/v1' },
      { id: 'server', label: 'Server Default', url: serverUrl },
    ]

    // Deduplicate: if serverUrl matches a fixed URL, don't show duplicate
    return allUrls.filter(
      (item, index, arr) => arr.findIndex((x) => x.url === item.url) === index
    )
  }, [status])

  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">{t('API Request URLs')}</p>
          <div className="space-y-0">
            {apiUrls.map((item) => (
              <ApiUrlRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
