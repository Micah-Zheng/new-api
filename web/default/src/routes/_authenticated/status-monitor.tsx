import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/layout'
import { useTheme } from '@/context/theme-provider'

const STATUS_MONITOR_BASE_URL = 'https://check.tcp.red'

export const Route = createFileRoute('/_authenticated/status-monitor')({
  component: StatusMonitor,
})

function StatusMonitor() {
  const { resolvedTheme } = useTheme()
  const src = `${STATUS_MONITOR_BASE_URL}?theme=${resolvedTheme}`

  return (
    <Main className='p-4'>
      <div className='bg-background min-h-0 flex-1 overflow-hidden rounded-xl border'>
        <iframe
          src={src}
          title='Status Monitor'
          className='h-full w-full border-0'
        />
      </div>
    </Main>
  )
}
