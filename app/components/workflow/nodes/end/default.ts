import type { NodeDefault } from '../../types'
import type { EndNodeType } from './types'
import { genNodeMetaData } from '@/app/components/workflow/utils'
import { BlockEnum } from '@/app/components/workflow/types'

const metaData = genNodeMetaData({
  sort: 2.1,
  type: BlockEnum.End,
  isRequired: false,
})
const nodeDefault: NodeDefault<EndNodeType> = {
  metaData,
  defaultValue: {
    // outputs is optional in agent-flow mode
    // Legacy mode will set this value when needed
  },
  checkValid() {
    // End node does not require any configuration
    // Always return valid
    return {
      isValid: true,
      errorMessage: '',
    }
  },
}

export default nodeDefault
