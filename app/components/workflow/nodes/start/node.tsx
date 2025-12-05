import type { FC } from 'react'
import React from 'react'
import type { StartNodeType } from './types'
import type { NodeProps } from '@/app/components/workflow/types'

/**
 * Start Node Component
 * Start node is just a marker, renders nothing
 */
const Node: FC<NodeProps<StartNodeType>> = () => {
  // Start node is just a marker with no content to display
  return null
}

export default React.memo(Node)
