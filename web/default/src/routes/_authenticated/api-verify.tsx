import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Loader2, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout'

const API_VERIFY_URL = 'https://is.real.dpdns.org/'
const LOAD_TIMEOUT_MS = 15_000

export const Route = createFileRoute('/_authenticated/api-verify')({
  component: ApiVerify,
})

function ApiVerify() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [didTimeout, setDidTimeout] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setDidTimeout(false)
    const timer = window.setTimeout(() => setDidTimeout(true), LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <Main className='p-4'>
      <div className='bg-background relative min-h-0 flex-1 overflow-hidden rounded-xl border'>
        {isLoading && !didTimeout && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'>
            <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' aria-hidden='true' />
            <span className='sr-only'>{t('Loading')}...</span>
          </div>
        )}
        {didTimeout && isLoading && (
          <div className='bg-background absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center'>
            <TriangleAlert className='text-muted-foreground h-8 w-8' />
            <p className='text-muted-foreground max-w-md text-sm'>
              {t('The embedded page did not finish loading. It may be blocked by network restrictions.')}
            </p>
            <a
              href={API_VERIFY_URL}
              target='_blank'
              rel='noreferrer noopener'
              className='text-primary inline-flex items-center gap-2 text-sm underline underline-offset-4'
            >
              {t('Open in a new tab')}
              <ExternalLink className='h-4 w-4' />
            </a>
          </div>
        )}
        <iframe
          src={API_VERIFY_URL}
          title={t('API Verification')}
          className={cn(
            'h-full w-full border-0 transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => {
            setIsLoading(false)
            setDidTimeout(false)
          }}
          allow='clipboard-read; clipboard-write'
          referrerPolicy='no-referrer'
        />
      </div>
    </Main>
  )
}
