import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SIZE_OPTIONS, QUALITY_OPTIONS, FORMAT_OPTIONS } from '../constants'
import type { ImageGenConfig } from '../types'

interface ParamsPanelProps {
  config: ImageGenConfig
  onConfigChange: (update: Partial<ImageGenConfig>) => void
  models: string[]
  groups: Array<{ label: string; value: string }>
}

export function ParamsPanel({
  config,
  onConfigChange,
  models,
  groups,
}: ParamsPanelProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs'>{t('Model')}</Label>
        <Select
          value={config.model}
          onValueChange={(v) => onConfigChange({ model: v })}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.length > 0 ? (
              models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))
            ) : (
              <SelectItem value={config.model}>{config.model}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {groups.length > 0 && (
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs'>{t('Group')}</Label>
          <Select
            value={config.group}
            onValueChange={(v) => onConfigChange({ group: v })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='auto'>Auto</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs'>{t('Size')}</Label>
        <Select
          value={config.size}
          onValueChange={(v) => onConfigChange({ size: v })}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs'>{t('Quality')}</Label>
          <Select
            value={config.quality}
            onValueChange={(v) => onConfigChange({ quality: v })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs'>{t('Count')}</Label>
          <Select
            value={String(config.n)}
            onValueChange={(v) => onConfigChange({ n: Number(v) })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label className='text-xs'>{t('Format')}</Label>
        <Select
          value={config.outputFormat}
          onValueChange={(v) => onConfigChange({ outputFormat: v })}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMAT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
