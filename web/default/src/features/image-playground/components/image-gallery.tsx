import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Download,
  Expand,
  Trash2,
  Copy,
  RotateCcw,
  Loader2,
  AlertCircle,
  Clock,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { ImageLightbox } from './image-lightbox'
import type { ImageTask } from '../types'

interface ImageGalleryProps {
  tasks: ImageTask[]
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  onClearHistory: () => void
}

export function ImageGallery({
  tasks,
  onRemove,
  onRetry,
  onClearHistory,
}: ImageGalleryProps) {
  const { t } = useTranslation()
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (tasks.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 text-center'>
        <div className='bg-muted rounded-full p-4'>
          <ImageIcon className='text-muted-foreground size-8' />
        </div>
        <div>
          <p className='text-muted-foreground text-sm'>
            {t('Enter a prompt and click Generate to create images')}
          </p>
        </div>
      </div>
    )
  }

  const getImageSrc = (image: { b64Json?: string; url?: string }, format: string) => {
    if (image.b64Json) {
      const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
      return `data:${mime};base64,${image.b64Json}`
    }
    return image.url ?? ''
  }

  const downloadImage = (src: string, taskId: string, index: number, format: string) => {
    const a = document.createElement('a')
    a.href = src
    a.download = `image-${taskId.slice(0, 8)}-${index}.${format}`
    a.click()
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast.success(t('Prompt copied'))
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between px-1'>
        <span className='text-muted-foreground text-xs'>
          {t('{{count}} generations', { count: tasks.length })}
        </span>
        <Button variant='ghost' size='sm' onClick={onClearHistory} className='text-xs h-7'>
          <Trash2 className='size-3' />
          {t('Clear')}
        </Button>
      </div>

      <div className='flex flex-col gap-4'>
        {tasks.map((task) => (
          <div
            key={task.id}
            className='bg-card rounded-lg border p-3 shadow-xs'
          >
            <div className='mb-2 flex items-start justify-between gap-2'>
              <p className='line-clamp-2 flex-1 text-sm'>{task.prompt}</p>
              <div className='flex shrink-0 items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-7'
                      onClick={() => copyPrompt(task.prompt)}
                    >
                      <Copy className='size-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('Copy prompt')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-7'
                      onClick={() => onRemove(task.id)}
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('Delete')}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className='text-muted-foreground mb-2 flex items-center gap-2 text-xs'>
              <span>{task.config.model}</span>
              <span>{task.config.size}</span>
              {task.elapsed != null && (
                <span className='flex items-center gap-0.5'>
                  <Clock className='size-3' />
                  {(task.elapsed / 1000).toFixed(1)}s
                </span>
              )}
            </div>

            {task.status === 'pending' && (
              <div className='flex items-center justify-center gap-2 rounded-md border border-dashed py-8'>
                <Loader2 className='text-muted-foreground size-5 animate-spin' />
                <span className='text-muted-foreground text-sm'>
                  {t('Generating...')}
                </span>
              </div>
            )}

            {task.status === 'error' && (
              <div className='flex flex-col items-center gap-2 rounded-md border border-dashed border-destructive/50 bg-destructive/5 py-6'>
                <AlertCircle className='text-destructive size-5' />
                <p className='text-destructive text-sm'>{task.error}</p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onRetry(task.id)}
                >
                  <RotateCcw className='size-3.5' />
                  {t('Retry')}
                </Button>
              </div>
            )}

            {task.status === 'done' && task.images.length > 0 && (
              <div
                className={`grid gap-2 ${
                  task.images.length === 1
                    ? 'grid-cols-1'
                    : task.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
                }`}
              >
                {task.images.map((image, idx) => {
                  const src = getImageSrc(image, task.config.outputFormat)
                  return (
                    <div
                      key={idx}
                      className='group relative overflow-hidden rounded-md border'
                    >
                      <img
                        src={src}
                        alt={task.prompt}
                        className='aspect-square w-full cursor-pointer object-cover transition-transform group-hover:scale-[1.02]'
                        onClick={() => setLightboxSrc(src)}
                      />
                      <div className='absolute right-1 bottom-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='secondary'
                              size='icon'
                              className='size-7 shadow-md'
                              onClick={() => setLightboxSrc(src)}
                            >
                              <Expand className='size-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('View')}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='secondary'
                              size='icon'
                              className='size-7 shadow-md'
                              onClick={() =>
                                downloadImage(src, task.id, idx, task.config.outputFormat)
                              }
                            >
                              <Download className='size-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('Download')}</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <ImageLightbox
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  )
}
