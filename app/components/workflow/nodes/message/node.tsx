import { type FC, memo } from 'react'
import type { NodeProps } from '../../types'
import type { MessageNodeType } from './types'
import { SettingItem } from '../_base/components/setting-item'
import { Group, GroupLabel } from '../_base/components/group'
import { useTranslation } from 'react-i18next'

const i18nPrefix = 'workflow.nodes.message'

const MessageNode: FC<NodeProps<MessageNodeType>> = (props) => {
  const { data } = props
  const { t } = useTranslation()

  const messagePreview = data.message
    ? data.message.length > 50
      ? `${data.message.substring(0, 50)}...`
      : data.message
    : t(`${i18nPrefix}.notSet`)

  return (
    <div className='mb-1 space-y-1 px-3'>
      <SettingItem label={t(`${i18nPrefix}.mode`)}>
        <span className='text-text-secondary'>{data.mode || 'llm'}</span>
      </SettingItem>

      <SettingItem label={t(`${i18nPrefix}.message`)}>
        <span className='text-text-secondary truncate text-xs'>{messagePreview}</span>
      </SettingItem>

      {data.mode === 'llm' && data.model && (
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

MessageNode.displayName = 'MessageNode'

export default memo(MessageNode)
