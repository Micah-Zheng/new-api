import { CopyButton } from '@/components/copy-button'
import { useApiUrlPing } from '../hooks/use-api-url-ping'
import { PingBadge } from './ping-badge'
import type { ApiUrlItem, PingState } from '../types'

interface ApiUrlRowProps {
  item: ApiUrlItem
}

export function ApiUrlRow({ item }: ApiUrlRowProps) {
  const { data, isLoading, isError, refetch } = useApiUrlPing(item.url)

  const pingState: PingState = {
    status: isLoading
      ? 'testing'
      : isError
        ? 'error'
        : data !== undefined
          ? 'success'
          : 'idle',
    latencyMs: data,
    errorReason: isError ? 'network' : undefined,
  }

  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0 gap-2">
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs text-muted-foreground">{item.label}</p>
        <code className="block truncate font-mono text-sm text-foreground">
          {item.url}
        </code>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PingBadge state={pingState} onTest={() => refetch()} />
        <CopyButton
          value={item.url}
          variant="outline"
          size="sm"
          className="h-7"
          tooltip="Copy URL"
        />
      </div>
    </div>
  )
}
