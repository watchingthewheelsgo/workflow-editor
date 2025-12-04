import type { CommonNodeType } from '@/app/components/workflow/types'

export type ModelConfig = {
  name: string
  temperature: number
}

export type MessageNodeType = CommonNodeType & {
  message: string
  mode: 'llm' | 'strict'
  model?: ModelConfig
}
