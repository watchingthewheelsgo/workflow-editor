import type { FC } from 'react'
import React from 'react'
import type { EndNodeType } from './types'
import type { NodePanelProps } from '@/app/components/workflow/types'

const Panel: FC<NodePanelProps<EndNodeType>> = () => {
  return (
    <div></div>
  )
}

export default React.memo(Panel)
