import { BlockEnum, type NodeDefault } from '../../types'
import type { RouterNodeType } from './types'
import { genNodeMetaData } from '../../utils'

const metaData = genNodeMetaData({
  sort: 6,
  type: BlockEnum.Router,
})

const nodeDefault: NodeDefault<RouterNodeType> = {
  metaData,
  defaultValue: {
    condition: '',
  },
  checkValid(payload) {
    if (!payload.condition || payload.condition.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Condition is required',
      }
    }

    if (payload.model && !payload.model.name) {
      return {
        isValid: false,
        errorMessage: 'Model name is required when model is specified',
      }
    }

    return {
      isValid: true,
      errorMessage: '',
    }
  },
}

export default nodeDefault
