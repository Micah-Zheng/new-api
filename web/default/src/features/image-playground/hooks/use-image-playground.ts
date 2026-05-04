import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUserModels, getUserGroups } from '@/lib/api'
import { generateImage } from '../api'
import { DEFAULT_CONFIG, STORAGE_KEYS, MAX_TASKS_STORED } from '../constants'
import type { ImageGenConfig, ImageTask, ImageGenRequest } from '../types'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function useImagePlayground() {
  const [config, setConfigState] = useState<ImageGenConfig>(() =>
    loadFromStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG)
  )
  const [tasks, setTasksState] = useState<ImageTask[]>(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, [])
  )
  const [generating, setGenerating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const setConfig = useCallback((update: Partial<ImageGenConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...update }
      saveToStorage(STORAGE_KEYS.CONFIG, next)
      return next
    })
  }, [])

  const setTasks = useCallback((updater: (prev: ImageTask[]) => ImageTask[]) => {
    setTasksState((prev) => {
      const next = updater(prev)
      saveToStorage(STORAGE_KEYS.TASKS, next.slice(0, MAX_TASKS_STORED))
      return next.slice(0, MAX_TASKS_STORED)
    })
  }, [])

  const modelsQuery = useQuery({
    queryKey: ['image-playground-models'],
    queryFn: async () => {
      const res = await getUserModels()
      if (!res.success || !Array.isArray(res.data)) return []
      return res.data
    },
  })

  const groupsQuery = useQuery({
    queryKey: ['image-playground-groups'],
    queryFn: async () => {
      const res = await getUserGroups()
      if (!res.success || !res.data) return []
      return Object.entries(res.data).map(([name, info]) => ({
        label: name,
        value: name,
        ratio: info.ratio,
      }))
    },
  })

  const generate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || generating) return
      if (!config.apiKey) {
        toast.error('Please enter your API Key')
        return
      }

      const taskId = crypto.randomUUID()
      const task: ImageTask = {
        id: taskId,
        status: 'pending',
        prompt: prompt.trim(),
        config: { ...config },
        images: [],
        createdAt: Date.now(),
      }

      setTasks((prev) => [task, ...prev])
      setGenerating(true)

      const controller = new AbortController()
      abortRef.current = controller

      const startTime = Date.now()

      try {
        const request: ImageGenRequest = {
          model: config.model,
          prompt: prompt.trim(),
          n: config.n,
          response_format: 'b64_json',
        }
        if (config.size !== 'auto') request.size = config.size
        if (config.quality !== 'auto') request.quality = config.quality
        if (config.outputFormat !== 'png') request.output_format = config.outputFormat

        const response = await generateImage(request, config.group, config.apiKey)
        const elapsed = Date.now() - startTime

        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          throw new Error('No images returned')
        }

        const images = response.data.map((item) => ({
          b64Json: item.b64_json,
          url: item.url,
          revisedPrompt: item.revised_prompt,
        }))

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: 'done' as const, images, elapsed } : t
          )
        )
      } catch (err: unknown) {
        const elapsed = Date.now() - startTime
        let message = 'Unknown error'
        if (err && typeof err === 'object') {
          const axiosErr = err as { response?: { data?: { error?: { message?: string }; message?: string }; status?: number }; message?: string }
          if (axiosErr.response?.data?.error?.message) {
            message = axiosErr.response.data.error.message
          } else if (axiosErr.response?.data?.message) {
            message = axiosErr.response.data.message
          } else if (axiosErr.message) {
            message = axiosErr.message
          }
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: 'error' as const, error: message, elapsed }
              : t
          )
        )
      } finally {
        setGenerating(false)
        abortRef.current = null
      }
    },
    [config, generating, setTasks]
  )

  const retry = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
      setConfig(task.config)
      generate(task.prompt)
    },
    [tasks, setConfig, generate]
  )

  const removeTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    },
    [setTasks]
  )

  const clearHistory = useCallback(() => {
    setTasks(() => [])
  }, [setTasks])

  return {
    config,
    setConfig,
    tasks,
    generating,
    models: modelsQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    modelsLoading: modelsQuery.isLoading,
    generate,
    retry,
    removeTask,
    clearHistory,
  }
}
