import type { NodeDefault } from '../../types'
import type { StartNodeType } from './types'
import { genNodeMetaData } from '@/app/components/workflow/utils'
import { BlockEnum } from '@/app/components/workflow/types'

const metaData = genNodeMetaData({
  sort: 0.1,
  type: BlockEnum.Start,
  isStart: true,
  isRequired: false,
  isSingleton: true,
  isTypeFixed: false, // support node type change for start node(user input)
  helpLinkUri: 'user-input',
})
const nodeDefault: NodeDefault<StartNodeType> = {
  metaData,
  defaultValue: {
    // variables is optional in agent-flow mode
    // Legacy mode will set this value when needed
  },
  checkValid() {
    return {
      isValid: true,
    }
  },
}

export default nodeDefault
