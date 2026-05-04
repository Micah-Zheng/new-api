import { createFileRoute } from '@tanstack/react-router'
import { AppHeader, Main } from '@/components/layout'

const IMAGE_PLAYGROUND_URL = '/image-playground/'

export const Route = createFileRoute('/_authenticated/image-playground')({
  component: ImagePlayground,
})

function ImagePlayground() {
  return (
    <>
      <AppHeader />
      <Main className='p-4'>
        <div className='bg-background min-h-0 flex-1 overflow-hidden rounded-xl border'>
          <iframe
            src={IMAGE_PLAYGROUND_URL}
            title='AI 绘图'
            className='h-full w-full border-0'
            allow='clipboard-read; clipboard-write'
          />
        </div>
      </Main>
    </>
  )
}
