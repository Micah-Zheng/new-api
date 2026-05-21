import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Loader2, Palette, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout'
import { useActiveChatKey } from '@/features/chat/hooks/use-active-chat-key'

const IMAGE_PLAYGROUND_BASE_URL = 'https://api.tcp.red/image-playground/'
const IMAGE_PLAYGROUND_SERVER_URL = 'https://api.tcp.red/v1'
const DEDICATED_KEY_NAME = '图片工坊-自动创建'
const LOAD_TIMEOUT_MS = 15_000

export const Route = createFileRoute('/_authenticated/image-playground')({
  component: ImagePlayground,
})

function ImagePlayground() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [didTimeout, setDidTimeout] = useState(false)

  const { data: apiKey, isPending: isKeyPending, isError: isKeyError, error: keyError } =
    useActiveChatKey(true, DEDICATED_KEY_NAME)

  const iframeSrc = apiKey
    ? `${IMAGE_PLAYGROUND_BASE_URL}?apiKey=${encodeURIComponent(apiKey)}&apiUrl=${encodeURIComponent(IMAGE_PLAYGROUND_SERVER_URL)}&codexCli=true`
    : undefined

  useEffect(() => {
    if (!iframeSrc) return
    setIsLoading(true)
    setDidTimeout(false)
    const timer = window.setTimeout(() => setDidTimeout(true), LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [iframeSrc])

  if (isKeyPending) {
    return (
      <Main className='p-4'>
        <div className='flex h-full flex-col items-center justify-center gap-3'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' aria-hidden='true' />
          <p className='text-muted-foreground text-sm'>{t('Preparing your API key…')}</p>
        </div>
      </Main>
    )
  }

  if (isKeyError || !iframeSrc) {
    const message = keyError instanceof Error ? keyError.message : t('Unable to load API key.')
    return (
      <Main className='p-4'>
        <div className='flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
          <TriangleAlert className='text-muted-foreground h-8 w-8' />
          <p className='text-muted-foreground max-w-md text-sm'>{message}</p>
        </div>
      </Main>
    )
  }

  return (
    <Main className='p-4'>
      <div className='bg-background relative min-h-0 flex-1 overflow-hidden rounded-xl border'>
        <a
          href={IMAGE_PLAYGROUND_BASE_URL}
          target='_blank'
          rel='noreferrer noopener'
          className={cn(
            'absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5',
            'bg-background/60 text-muted-foreground text-xs backdrop-blur-sm',
            'opacity-0 transition-opacity hover:opacity-100 focus:opacity-100',
            'border shadow-sm hover:text-foreground'
          )}
          title={t('Open in a new tab')}
        >
          <Palette className='h-3.5 w-3.5' />
          <ExternalLink className='h-3.5 w-3.5' />
        </a>
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
              href={IMAGE_PLAYGROUND_BASE_URL}
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
          src={iframeSrc}
          key={iframeSrc}
          title={t('Image Playground')}
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
