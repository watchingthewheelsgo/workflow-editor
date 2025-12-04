import { BlockEnum, type NodeDefault } from '../../types'
import type { MessageNodeType } from './types'
import { genNodeMetaData } from '../../utils'

const metaData = genNodeMetaData({
  sort: 4,
  type: BlockEnum.Message,
})

const nodeDefault: NodeDefault<MessageNodeType> = {
  metaData,
  defaultValue: {
    message: '',
    mode: 'strict',
  },
  checkValid(payload) {
    if (!payload.message || payload.message.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Message content is required',
      }
    }

    if (payload.mode === 'llm') {
      if (!payload.model || !payload.model.name) {
        return {
          isValid: false,
          errorMessage: 'Model name is required in LLM mode',
        }
      }
    }

    return {
      isValid: true,
      errorMessage: '',
    }
  },
}

export default nodeDefault
