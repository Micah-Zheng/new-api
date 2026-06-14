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
        : data?.error
          ? 'error'
          : data?.latency !== null && data?.latency !== undefined
          ? 'success'
          : 'idle',
    latencyMs: data?.latency ?? undefined,
    errorReason: isError ? 'network' : undefined,
  }

  return (
    <div className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-colors hover:border-border hover:bg-card">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
        <code className="block truncate font-mono text-sm text-foreground">
          {item.url}
        </code>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <PingBadge state={pingState} onTest={() => refetch()} />
        <CopyButton
          value={item.url}
          variant="outline"
          size="sm"
          className="h-8"
          tooltip="Copy URL"
        />
      </div>
    </div>
  )
}
