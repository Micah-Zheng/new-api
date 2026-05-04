import type { ImageGenConfig } from './types'

export const STORAGE_KEYS = {
  CONFIG: 'image_playground_config',
  TASKS: 'image_playground_tasks',
} as const

export const DEFAULT_CONFIG: ImageGenConfig = {
  model: 'gpt-image-1',
  group: 'auto',
  size: 'auto',
  quality: 'auto',
  n: 1,
  outputFormat: 'png',
  apiKey: '',
}

export const SIZE_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '1024 × 1024', value: '1024x1024' },
  { label: '1536 × 1024', value: '1536x1024' },
  { label: '1024 × 1536', value: '1024x1536' },
  { label: '1792 × 1024', value: '1792x1024' },
  { label: '1024 × 1792', value: '1024x1792' },
] as const

export const QUALITY_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
] as const

export const FORMAT_OPTIONS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'WebP', value: 'webp' },
] as const

export const MAX_TASKS_STORED = 50
