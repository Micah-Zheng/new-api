import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ImageLightboxProps {
  src: string | null
  onClose: () => void
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  const { t } = useTranslation()

  const handleDownload = () => {
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = `image-${Date.now()}.png`
    a.click()
  }

  return (
    <Dialog open={!!src} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-4xl p-2' showCloseButton>
        {src && (
          <div className='flex flex-col gap-2'>
            <img
              src={src}
              alt='Generated image'
              className='max-h-[80vh] w-full rounded-md object-contain'
            />
            <div className='flex justify-end'>
              <Button variant='outline' size='sm' onClick={handleDownload}>
                <Download className='size-4' />
                {t('Download')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
