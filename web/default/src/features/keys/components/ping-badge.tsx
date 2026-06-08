import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getLatencyColorClass } from '@/features/dashboard/lib/api-info'
import type { PingState } from '../types'

interface PingBadgeProps {
  state: PingState
  onTest: () => void
}

export function PingBadge({ state, onTest }: PingBadgeProps) {
  if (state.status === 'idle') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onTest}
        className="text-xs h-7 px-2"
      >
        Test
      </Button>
    )
  }

  if (state.status === 'testing') {
    return (
      <Badge variant="secondary" className="text-xs h-7 px-2">
        Testing...
      </Badge>
    )
  }

  if (state.status === 'success' && state.latencyMs !== undefined) {
    const colorClass = getLatencyColorClass(state.latencyMs)
    return (
      <Badge
        variant="secondary"
        className={`text-xs h-7 px-2 cursor-pointer ${colorClass}`}
        onClick={onTest}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTest()
          }
        }}
      >
        {state.latencyMs}ms
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className="text-xs h-7 px-2 text-muted-foreground"
    >
      N/A
    </Badge>
  )
}
