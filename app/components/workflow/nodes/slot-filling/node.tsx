import { type FC, memo } from 'react'
import type { NodeProps } from '../../types'
import type { SlotFillingNodeType } from './types'
import { SettingItem } from '../_base/components/setting-item'
import { Group, GroupLabel } from '../_base/components/group'
import { useTranslation } from 'react-i18next'

const i18nPrefix = 'workflow.nodes.slotFilling'

const SlotFillingNode: FC<NodeProps<SlotFillingNodeType>> = (props) => {
  const { data } = props
  const { t } = useTranslation()

  const questionPreview = data.question
    ? data.question.length > 50
      ? `${data.question.substring(0, 50)}...`
      : data.question
    : t(`${i18nPrefix}.notSet`)

  return (
    <div className='mb-1 space-y-1 px-3'>
      <SettingItem label={t(`${i18nPrefix}.slotName`)}>
        <span className='text-text-secondary'>{data.slot_name || t(`${i18nPrefix}.notSet`)}</span>
      </SettingItem>

      <SettingItem label={t(`${i18nPrefix}.question`)}>
        <span className='text-text-secondary truncate text-xs'>{questionPreview}</span>
      </SettingItem>

      <SettingItem label={t(`${i18nPrefix}.maxTurns`)}>
        <span className='text-text-secondary'>{data.max_turns || 3}</span>
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

      {data.validation && (
        <Group label={<GroupLabel className='mt-1'>{t(`${i18nPrefix}.validation`)}</GroupLabel>}>
          <div className='text-text-secondary text-sm px-2 py-1'>
            <span className='truncate text-xs'>{data.validation.criteria || t(`${i18nPrefix}.notSet`)}</span>
          </div>
        </Group>
      )}
    </div>
  )
}

SlotFillingNode.displayName = 'SlotFillingNode'

export default memo(SlotFillingNode)
