import { memo, useEffect, useMemo, useState } from 'react'
import { Activity, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUptimeStatus } from '@/features/dashboard/api'
import type {
  UptimeGroupResult,
  UptimeMonitor,
} from '@/features/dashboard/types'
import { PanelWrapper } from '../ui/panel-wrapper'

const STATUS_COLOR_MAP: Record<number, string> = {
  1: 'bg-success',
  0: 'bg-destructive',
  2: 'bg-warning',
  3: 'bg-info',
}
const DEFAULT_STATUS_COLOR = 'bg-muted-foreground/40'

const StatusDot = memo(function StatusDot(props: { status: number }) {
  const color = STATUS_COLOR_MAP[props.status] ?? DEFAULT_STATUS_COLOR
  return <span className={cn('inline-block size-2 rounded-full', color)} />
})

function formatUptimeDuration(
  startTime: number | null | undefined,
  nowMs: number,
  t: (key: string) => string
) {
  if (!startTime) {
    return t('Unknown')
  }

  const totalMinutes = Math.max(0, Math.floor((nowMs - startTime * 1000) / 60000))
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`)
  }

  return parts.join(' ')
}

export function UptimePanel() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [groups, setGroups] = useState<UptimeGroupResult[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, 60 * 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    getUptimeStatus()
      .then((res) => {
        if (abortController.signal.aborted) return
        setGroups(res?.data || [])
      })
      .catch(() => {
        if (abortController.signal.aborted) return
        setGroups([])
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      abortController.abort()
    }
  }, [])

  const handleRefresh = () => {
    const abortController = new AbortController()
    setRefreshing(true)

    getUptimeStatus()
      .then((res) => {
        if (abortController.signal.aborted) return
        setGroups(res?.data || [])
      })
      .catch(() => {
        if (abortController.signal.aborted) return
        setGroups([])
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setRefreshing(false)
        }
      })
  }

  const startTime =
    (status?.start_time as number | undefined) ??
    (status?.data?.start_time as number | undefined)

  const hostBootTime =
    (status?.host_boot_time as number | undefined) ??
    (status?.data?.host_boot_time as number | undefined)

  const runtimeCard = useMemo(
    () => ({
      value: formatUptimeDuration(startTime, nowMs, t),
      since: startTime ? formatTimestampToDate(startTime) : t('Unknown'),
      hostValue: formatUptimeDuration(hostBootTime, nowMs, t),
      hostSince: hostBootTime ? formatTimestampToDate(hostBootTime) : t('Unknown'),
    }),
    [nowMs, startTime, hostBootTime, t]
  )

  return (
    <PanelWrapper
      title={
        <span className='flex items-center gap-2'>
          <Activity className='text-muted-foreground/60 size-4' />
          {t('Uptime')}
        </span>
      }
      description={t('Grouped monitor status from Uptime Kuma')}
      loading={loading}
      height='h-80'
      contentClassName='p-0'
      headerActions={
        <Button
          variant='ghost'
          size='sm'
          onClick={handleRefresh}
          disabled={refreshing}
          className='size-7 p-0'
        >
          <RotateCw
            className={cn('size-3.5', refreshing && 'animate-spin')}
            aria-label={t('Refresh')}
          />
        </Button>
      }
    >
      <div className='space-y-5'>
        <div className='space-y-1'>
          {[
            {
              label: t('Service'),
              value: runtimeCard.value,
              since: runtimeCard.since,
              icon: Activity,
            },
            ...(runtimeCard.hostValue && runtimeCard.hostValue !== t('Unknown')
              ? [
                  {
                    label: t('Host'),
                    value: runtimeCard.hostValue,
                    since: runtimeCard.hostSince,
                    icon: Activity,
                  },
                ]
              : []),
          ].map((row, idx) => {
            const Icon = row.icon
            return (
              <div
                key={idx}
                className='hover:bg-muted/40 flex items-center justify-between px-4 py-2.5 transition-colors sm:px-5'
              >
                <div className='flex min-w-0 items-center gap-2.5'>
                  <Icon className='text-muted-foreground/50 size-3.5 shrink-0' />
                  <div className='min-w-0'>
                    <div className='text-muted-foreground text-xs font-medium'>
                      {row.label}
                    </div>
                    <div className='text-muted-foreground/50 text-[10px]'>
                      {t('since')} {row.since}
                    </div>
                  </div>
                </div>
                <span className='text-foreground shrink-0 font-mono text-sm tabular-nums'>
                  {row.value}
                </span>
              </div>
            )
          })}
        </div>

        {groups.length ? (
          <>
            <div className='border-border/60 border-t' />
            <ScrollArea className='h-44'>
              <div className='-mx-4 space-y-0 sm:-mx-5'>
              {groups.map((group, groupIdx) => (
                <div key={group.categoryName}>
                  <div className='bg-muted/30 border-border/60 border-b px-4 py-2 sm:px-5'>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                        {group.categoryName}
                      </h4>
                      <span className='text-muted-foreground/40 font-mono text-xs tabular-nums'>
                        {group.monitors?.length || 0}
                      </span>
                    </div>
                  </div>

                  {group.monitors?.map(
                    (monitor: UptimeMonitor, monitorIdx: number) => (
                      <div
                        key={monitor.name}
                        className={cn(
                          'hover:bg-muted/40 flex items-center justify-between px-4 py-2.5 transition-colors sm:px-5',
                          monitorIdx < (group.monitors?.length || 0) - 1 &&
                            'border-border/40 border-b',
                          groupIdx < groups.length - 1 &&
                            monitorIdx === (group.monitors?.length || 0) - 1 &&
                            'border-border/60 border-b'
                        )}
                      >
                        <div className='flex min-w-0 items-center gap-2.5'>
                          <StatusDot status={monitor.status} />
                          <span className='truncate text-sm'>{monitor.name}</span>
                          {monitor.group && (
                            <span className='text-muted-foreground/40 shrink-0 text-xs'>
                              ({monitor.group})
                            </span>
                          )}
                        </div>
                        <span className='text-foreground shrink-0 font-mono text-sm font-semibold tabular-nums'>
                          {((monitor.uptime ?? 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          </>
        ) : null}
      </div>
    </PanelWrapper>
  )
}
