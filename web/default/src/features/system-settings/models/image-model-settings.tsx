/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { memo, useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUpdateOption } from '../hooks/use-update-option'

const OPTION_KEY = 'image_model_setting'

const BILLING_MODE_TOKEN = 'token'
const BILLING_MODE_PER_SIZE = 'per_size'

// Built-in defaults shown in the UI when no custom price is configured.
// These match the Go-side defaultImagePerSizePrice() fallbacks.
const DEFAULT_PER_SIZE_PRICES: Record<string, { p1k: number; p2k: number; p4k: number }> = {
  'gpt-image-1':          { p1k: 0.011, p2k: 0.042, p4k: 0.167 },
  'gpt-image-1-mini':     { p1k: 0.011, p2k: 0.042, p4k: 0.167 },
  'gpt-image-1.5':        { p1k: 0.011, p2k: 0.042, p4k: 0.167 },
  'gpt-image-2':          { p1k: 0.011, p2k: 0.042, p4k: 0.167 },
  'chatgpt-image-latest': { p1k: 0.011, p2k: 0.042, p4k: 0.167 },
  'dall-e-2':             { p1k: 0.04,  p2k: 0.08,  p4k: 0.12  },
  'dall-e-3':             { p1k: 0.04,  p2k: 0.08,  p4k: 0.12  },
}

const DEFAULT_MODELS = Object.keys(DEFAULT_PER_SIZE_PRICES)

type ImageModelConfig = {
  billing_mode: string
  price_1k?: number | null
  price_2k?: number | null
  price_4k?: number | null
}

type ImageModelRow = {
  id: number
  name: string
  billing_mode: string
  price_1k: string
  price_2k: string
  price_4k: string
}

type RawSetting = {
  models?: Record<string, ImageModelConfig>
}

function parseInitialRows(rawValue: string | undefined): ImageModelRow[] {
  let parsed: RawSetting = {}
  if (rawValue) {
    try {
      parsed = JSON.parse(rawValue) as RawSetting
    } catch {
      // ignore
    }
  }

  const models: Record<string, ImageModelConfig> = parsed.models ?? {}

  // Merge defaults with saved config
  const merged: Record<string, ImageModelConfig> = {}
  for (const name of DEFAULT_MODELS) {
    const saved = models[name]
    merged[name] = saved
      ? { ...saved }
      : { billing_mode: BILLING_MODE_TOKEN }
  }
  // Add any extra models the admin added
  for (const [name, cfg] of Object.entries(models)) {
    if (!(name in merged)) {
      merged[name] = cfg
    }
  }

  return Object.entries(merged).map(([name, cfg], idx) => ({
    id: idx + 1,
    name,
    billing_mode: cfg.billing_mode ?? BILLING_MODE_TOKEN,
    price_1k: cfg.price_1k != null ? String(cfg.price_1k) : '',
    price_2k: cfg.price_2k != null ? String(cfg.price_2k) : '',
    price_4k: cfg.price_4k != null ? String(cfg.price_4k) : '',
  }))
}

function rowsToSetting(rows: ImageModelRow[]): RawSetting {
  const models: Record<string, ImageModelConfig> = {}
  for (const row of rows) {
    const name = row.name.trim()
    if (!name) continue
    const cfg: ImageModelConfig = { billing_mode: row.billing_mode }
    if (row.billing_mode === BILLING_MODE_PER_SIZE) {
      const p1k = parseFloat(row.price_1k)
      const p2k = parseFloat(row.price_2k)
      const p4k = parseFloat(row.price_4k)
      if (!isNaN(p1k)) cfg.price_1k = p1k
      if (!isNaN(p2k)) cfg.price_2k = p2k
      if (!isNaN(p4k)) cfg.price_4k = p4k
    }
    models[name] = cfg
  }
  return { models }
}

type ImageModelSettingsProps = {
  defaultValue: string
}

export const ImageModelSettings = memo(function ImageModelSettings({
  defaultValue,
}: ImageModelSettingsProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const [rows, setRows] = useState<ImageModelRow[]>([])
  const [nextId, setNextId] = useState(1)

  useEffect(() => {
    const initial = parseInitialRows(defaultValue)
    setRows(initial)
    setNextId(initial.length + 1)
  }, [defaultValue])

  const updateRow = useCallback(
    (id: number, field: keyof ImageModelRow, value: string) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      )
    },
    []
  )

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        name: '',
        billing_mode: BILLING_MODE_TOKEN,
        price_1k: '',
        price_2k: '',
        price_4k: '',
      },
    ])
    setNextId((n) => n + 1)
  }, [nextId])

  const removeRow = useCallback((id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleSave = useCallback(async () => {
    const setting = rowsToSetting(rows)
    await updateOption.mutateAsync({
      key: OPTION_KEY,
      value: JSON.stringify(setting),
    })
  }, [rows, updateOption])

  return (
    <div className='space-y-4'>
      <Alert>
        <AlertDescription className='space-y-1 text-sm'>
          <div>
            {t(
              'Configure billing mode for image generation models. "Per-token" uses the standard token ratio. "Per-resolution" charges a flat price per image based on output size (1K ≤ 1024px, 2K ≤ 2048px, 4K > 2048px).'
            )}
          </div>
          <div>
            {t(
              'Leave price fields empty to use the built-in default prices. Custom prices override the defaults.'
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={addRow}>
          <Plus className='mr-2 h-4 w-4' />
          {t('Add model')}
        </Button>
      </div>

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[160px]'>{t('Model name')}</TableHead>
              <TableHead className='w-[160px]'>{t('Billing mode')}</TableHead>
              <TableHead className='w-[110px]'>
                {t('1K price ($/img)')}
              </TableHead>
              <TableHead className='w-[110px]'>
                {t('2K price ($/img)')}
              </TableHead>
              <TableHead className='w-[110px]'>
                {t('4K price ($/img)')}
              </TableHead>
              <TableHead className='w-[60px] text-right'>
                {t('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-muted-foreground py-8 text-center'
                >
                  {t('No image models configured')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isPerSize = row.billing_mode === BILLING_MODE_PER_SIZE
                const defaults = DEFAULT_PER_SIZE_PRICES[row.name]
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        value={row.name}
                        placeholder='gpt-image-2'
                        onChange={(e) =>
                          updateRow(row.id, 'name', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.billing_mode}
                        onValueChange={(v) =>
                          updateRow(row.id, 'billing_mode', v ?? BILLING_MODE_TOKEN)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BILLING_MODE_TOKEN}>
                            {t('Per-token')}
                          </SelectItem>
                          <SelectItem value={BILLING_MODE_PER_SIZE}>
                            {t('Per-resolution')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min={0}
                        step={0.001}
                        disabled={!isPerSize}
                        placeholder={
                          isPerSize && defaults
                            ? String(defaults.p1k)
                            : undefined
                        }
                        value={row.price_1k}
                        onChange={(e) =>
                          updateRow(row.id, 'price_1k', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min={0}
                        step={0.001}
                        disabled={!isPerSize}
                        placeholder={
                          isPerSize && defaults
                            ? String(defaults.p2k)
                            : undefined
                        }
                        value={row.price_2k}
                        onChange={(e) =>
                          updateRow(row.id, 'price_2k', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min={0}
                        step={0.001}
                        disabled={!isPerSize}
                        placeholder={
                          isPerSize && defaults
                            ? String(defaults.p4k)
                            : undefined
                        }
                        value={row.price_4k}
                        onChange={(e) =>
                          updateRow(row.id, 'price_4k', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeRow(row.id)}
                        aria-label={t('Delete')}
                      >
                        <Trash2 className='text-destructive h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={updateOption.isPending}>
          {t('Save image model settings')}
        </Button>
      </div>
    </div>
  )
})
