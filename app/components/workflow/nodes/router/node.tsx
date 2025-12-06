import { type FC, memo } from 'react'
import type { NodeProps } from '../../types'
import type { RouterNodeType } from './types'
import { SettingItem } from '../_base/components/setting-item'
import { Group, GroupLabel } from '../_base/components/group'
import { useTranslation } from 'react-i18next'

const i18nPrefix = 'workflow.nodes.router'

const RouterNode: FC<NodeProps<RouterNodeType>> = (props) => {
  const { data } = props
  const { t } = useTranslation()

  const conditionPreview = data.condition
    ? data.condition.length > 50
      ? `${data.condition.substring(0, 50)}...`
      : data.condition
    : t(`${i18nPrefix}.notSet`)

  return (
    <div className='mb-1 space-y-1 px-3'>
      <SettingItem label={t(`${i18nPrefix}.condition`)}>
        <span className='text-text-secondary truncate text-xs'>{conditionPreview}</span>
      </SettingItem>

      {data.model && (
        <Group label={<GroupLabel className='mt-1'>{t(`${i18nPrefix}.model`)}</GroupLabel>}>
          <div className='text-text-secondary text-sm'>
            <div className='flex items-center justify-between px-2 py-1'>
              <span>Name:</span>
              <span className='font-medium'>{data.model.name}</span>
            </div>
            <div className='flex items-center justify-between px-2 py-1'>
              <span>Temperature:</span>
              <span className='font-medium'>{data.model.temperature}</span>
            </div>
          </div>
        </Group>
      )}
    </div>
  )
}

RouterNode.displayName = 'RouterNode'

export default memo(RouterNode)
