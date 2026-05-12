import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/layout'

const STATUS_MONITOR_URL = 'https://check.tcp.red'

export const Route = createFileRoute('/_authenticated/status-monitor')({
  component: StatusMonitor,
})

function StatusMonitor() {
  return (
    <Main className='p-4'>
      <div className='bg-background min-h-0 flex-1 overflow-hidden rounded-xl border'>
        <iframe
          src={STATUS_MONITOR_URL}
          title='Status Monitor'
          className='h-full w-full border-0'
        />
      </div>
    </Main>
  )
}
