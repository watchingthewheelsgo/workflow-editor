import type { FC } from 'react'
import React from 'react'
import type { EndNodeType } from './types'
import type { NodeProps } from '@/app/components/workflow/types'

/**
 * End Node Component
 * End node is just a marker, renders nothing
 */
const Node: FC<NodeProps<EndNodeType>> = () => {
  // End node is just a marker with no content to display
  return null
}

export default React.memo(Node)
