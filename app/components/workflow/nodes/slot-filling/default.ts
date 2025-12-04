import { BlockEnum, type NodeDefault } from '../../types'
import type { SlotFillingNodeType } from './types'
import { genNodeMetaData } from '../../utils'

const metaData = genNodeMetaData({
  sort: 5,
  type: BlockEnum.SlotFilling,
})

const nodeDefault: NodeDefault<SlotFillingNodeType> = {
  metaData,
  defaultValue: {
    slot_name: '',
    question: '',
    model: {
      name: 'gpt-4.1',
      temperature: 0.0,
    },
    max_turns: 3,
  },
  checkValid(payload) {
    if (!payload.slot_name || payload.slot_name.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Slot name is required',
      }
    }

    if (!payload.question || payload.question.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Question is required',
      }
    }

    if (!payload.model || !payload.model.name) {
      return {
        isValid: false,
        errorMessage: 'Model name is required',
      }
    }

    if (payload.max_turns === undefined || payload.max_turns < 1) {
      return {
        isValid: false,
        errorMessage: 'Max turns must be at least 1',
      }
    }

    if (payload.validation && payload.validation.criteria && !payload.validation.criteria.trim()) {
      return {
        isValid: false,
        errorMessage: 'Validation criteria cannot be empty',
      }
    }

    return {
      isValid: true,
      errorMessage: '',
    }
  },
}

export default nodeDefault
