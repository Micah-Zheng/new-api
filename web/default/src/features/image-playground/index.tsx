import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useImagePlayground } from './hooks'
import { PromptInput } from './components/prompt-input'
import { ParamsPanel } from './components/params-panel'
import { ImageGallery } from './components/image-gallery'

export function ImagePlayground() {
  const { t } = useTranslation()
  const {
    config,
    setConfig,
    tasks,
    generating,
    models,
    groups,
    generate,
    retry,
    removeTask,
    clearHistory,
  } = useImagePlayground()

  const [prompt, setPrompt] = useState('')
  const [showParams, setShowParams] = useState(true)
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = (text: string) => {
    if (!text.trim()) return
    generate(text)
    setPrompt('')
  }

  const apiKeyInput = (
    <div className='flex flex-col gap-1.5'>
      <Label className='text-xs'>{t('API Key')}</Label>
      <div className='relative'>
        <Input
          type={showKey ? 'text' : 'password'}
          value={config.apiKey}
          onChange={(e) => setConfig({ apiKey: e.target.value })}
          placeholder='sk-...'
          className='pr-9'
        />
        <Button
          variant='ghost'
          size='icon'
          className='absolute top-0 right-0 size-9'
          onClick={() => setShowKey((v) => !v)}
        >
          {showKey ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
        </Button>
      </div>
      {!config.apiKey && (
        <p className='text-destructive text-xs'>{t('API Key is required')}</p>
      )}
    </div>
  )

  return (
    <div className='flex h-full'>
      {/* Left panel - Input (desktop) */}
      <div className='hidden w-80 shrink-0 flex-col border-r md:flex'>
        <div className='flex items-center justify-between px-4 pt-4 pb-2'>
          <h2 className='text-sm font-medium'>{t('AI Drawing')}</h2>
          <Button
            variant='ghost'
            size='icon'
            className='size-7'
            onClick={() => setShowParams((v) => !v)}
          >
            <Settings2 className='size-4' />
          </Button>
        </div>
        <ScrollArea className='flex-1 px-4 pb-4'>
          <div className='flex flex-col gap-4'>
            {apiKeyInput}
            <Separator />
            <PromptInput
              prompt={prompt}
              onPromptChange={setPrompt}
              onSubmit={handleSubmit}
              generating={generating}
            />
            {showParams && (
              <>
                <Separator />
                <ParamsPanel
                  config={config}
                  onConfigChange={setConfig}
                  models={models}
                  groups={groups}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile input */}
      <div className='fixed right-0 bottom-0 left-0 z-10 border-t bg-background p-3 md:hidden'>
        <div className='flex flex-col gap-2'>
          {!config.apiKey && apiKeyInput}
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            generating={generating}
          />
        </div>
      </div>

      {/* Right panel - Gallery */}
      <ScrollArea className='flex-1'>
        <div className='mx-auto max-w-4xl p-4 pb-24 md:pb-4'>
          <ImageGallery
            tasks={tasks}
            onRemove={removeTask}
            onRetry={retry}
            onClearHistory={clearHistory}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
