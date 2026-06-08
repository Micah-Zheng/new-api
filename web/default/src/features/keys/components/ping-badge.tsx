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
        className="h-8 px-3 text-xs"
      >
        Test
      </Button>
    )
  }

  if (state.status === 'testing') {
    return (
      <Badge variant="secondary" className="h-8 min-w-[60px] justify-center px-3 text-xs font-medium">
        <span className="animate-pulse">Testing...</span>
      </Badge>
    )
  }

  if (state.status === 'success' && state.latencyMs !== undefined) {
    const colorClass = getLatencyColorClass(state.latencyMs)
    return (
      <Badge
        variant="secondary"
        className={`h-8 min-w-[60px] cursor-pointer justify-center px-3 text-xs font-semibold transition-all hover:scale-105 ${colorClass}`}
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
      className="h-8 min-w-[60px] justify-center px-3 text-xs text-muted-foreground"
      onClick={onTest}
      role="button"
      tabIndex={0}
    >
      N/A
    </Badge>
  )
}
