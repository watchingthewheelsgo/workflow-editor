import type { CommonNodeType } from '@/app/components/workflow/types'

export type ModelConfig = {
  name: string
  temperature: number
}

export type RouterNodeType = CommonNodeType & {
  condition: string
  model?: ModelConfig
}
