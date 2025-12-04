import type { CommonNodeType } from '@/app/components/workflow/types'

export type ModelConfig = {
  name: string
  temperature: number
}

export type ValidationConfig = {
  criteria: string
  model?: ModelConfig
}

export type SlotFillingNodeType = CommonNodeType & {
  slot_name: string
  question: string
  model: ModelConfig
  max_turns: number
  validation?: ValidationConfig
}
