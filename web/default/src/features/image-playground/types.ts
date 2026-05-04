export interface ImageGenConfig {
  model: string
  group: string
  size: string
  quality: string
  n: number
  outputFormat: string
  apiKey: string
}

export interface GeneratedImage {
  b64Json?: string
  url?: string
  revisedPrompt?: string
}

export interface ImageTask {
  id: string
  status: 'pending' | 'done' | 'error'
  prompt: string
  config: ImageGenConfig
  images: GeneratedImage[]
  error?: string
  createdAt: number
  elapsed?: number
}

export interface ImageGenRequest {
  model: string
  prompt: string
  size?: string
  quality?: string
  n?: number
  response_format?: string
  output_format?: string
}

export interface ImageGenResponse {
  created: number
  data: Array<{
    b64_json?: string
    url?: string
    revised_prompt?: string
  }>
}
