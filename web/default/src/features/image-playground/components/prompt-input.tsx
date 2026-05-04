import { useTranslation } from 'react-i18next'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  generating: boolean
  prompt: string
  onPromptChange: (prompt: string) => void
}

export function PromptInput({
  onSubmit,
  generating,
  prompt,
  onPromptChange,
}: PromptInputProps) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !generating) {
      e.preventDefault()
      onSubmit(prompt)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('Describe the image you want to generate...')}
        className='min-h-28 resize-none'
        disabled={generating}
      />
      <Button
        onClick={() => onSubmit(prompt)}
        disabled={generating || !prompt.trim()}
        className='w-full'
      >
        {generating ? (
          <>
            <Loader2 className='size-4 animate-spin' />
            {t('Generating...')}
          </>
        ) : (
          <>
            <Send className='size-4' />
            {t('Generate')}
            <kbd className='bg-primary-foreground/20 ml-auto rounded px-1.5 py-0.5 text-xs'>
              Ctrl+Enter
            </kbd>
          </>
        )}
      </Button>
    </div>
  )
}
