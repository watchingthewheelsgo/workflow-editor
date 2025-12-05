import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { StartNodeType } from './types'
import type { NodePanelProps } from '@/app/components/workflow/types'

const i18nPrefix = 'workflow.nodes.start'

const Panel: FC<NodePanelProps<StartNodeType>> = () => {
  const { t } = useTranslation()

  return (
    <div className='mt-2'>
      <div className='space-y-4 px-4 pb-4'>
        <div className='rounded-lg bg-background-section-burn p-3'>
          <div className='mb-1 text-sm font-medium text-text-secondary'>
            {t(`${i18nPrefix}.title`) || 'Start Node'}
          </div>
          <div className='text-xs text-text-tertiary'>
            {t(`${i18nPrefix}.description`) || 'This node marks the start of the workflow. No configuration is required.'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Panel)
