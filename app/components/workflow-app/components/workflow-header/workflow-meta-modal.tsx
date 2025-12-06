import React, { type FC, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCloseLine } from '@remixicon/react'
import Button from '@/app/components/base/button'
import Input from '@/app/components/base/input'
import Toast from '@/app/components/base/toast'
import cn from '@/utils/classnames'

type WorkflowMetaModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (params: { name: string; goal: string }) => void
  initialName?: string
  initialGoal?: string
}

const NAME_MAX_LENGTH = 50
const GOAL_MAX_LENGTH = 200

const WorkflowMetaModal: FC<WorkflowMetaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialGoal = '',
}) => {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [goal, setGoal] = useState(initialGoal)
  const [nameError, setNameError] = useState(false)
  const [goalError, setGoalError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setGoal(initialGoal)
      setNameError(false)
      setGoalError(false)
    }
  }, [isOpen, initialName, initialGoal])

  const handleSave = () => {
    let hasError = false

    if (!name.trim()) {
      setNameError(true)
      Toast.notify({
        type: 'error',
        message: t('workflow.workflowMeta.nameRequired'),
      })
      hasError = true
    }
    else if (name.length > NAME_MAX_LENGTH) {
      setNameError(true)
      Toast.notify({
        type: 'error',
        message: t('workflow.workflowMeta.nameLengthLimit', { limit: NAME_MAX_LENGTH }),
      })
      hasError = true
    }
    else {
      if (nameError)
        setNameError(false)
    }

    if (!goal.trim()) {
      setGoalError(true)
      Toast.notify({
        type: 'error',
        message: t('workflow.workflowMeta.goalRequired'),
      })
      hasError = true
    }
    else if (goal.length > GOAL_MAX_LENGTH) {
      setGoalError(true)
      Toast.notify({
        type: 'error',
        message: t('workflow.workflowMeta.goalLengthLimit', { limit: GOAL_MAX_LENGTH }),
      })
      hasError = true
    }
    else {
      if (goalError)
        setGoalError(false)
    }

    if (hasError)
      return

    onSave({ name: name.trim(), goal: goal.trim() })
    onClose()
  }

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (nameError)
      setNameError(false)
  }, [nameError])

  const handleGoalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value)
    if (goalError)
      setGoalError(false)
  }, [goalError])

  if (!isOpen)
    return null

  return (
    <div className='fixed inset-0 z-[9998] flex items-center justify-center bg-background-overlay'>
      <div
        className={cn(
          'flex w-[480px] max-h-[80%] flex-col rounded-2xl border-[0.5px] border-components-panel-border bg-components-panel-bg shadow-xs',
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className='title-2xl-semi-bold relative shrink-0 p-6 pb-3 pr-14 text-text-primary'>
          {t('workflow.workflowMeta.title')}
          <div className='system-xs-regular mt-1 text-text-tertiary'>
            {t('workflow.workflowMeta.subtitle')}
          </div>
          <div
            className='absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg'
            onClick={onClose}
          >
            <RiCloseLine className='h-5 w-5 text-text-tertiary' />
          </div>
        </div>
        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-3'>
          <div className='flex flex-col gap-y-4'>
            <div className='flex flex-col gap-y-1'>
              <div className='system-sm-semibold flex h-6 items-center text-text-secondary'>
                {t('workflow.workflowMeta.name')}
                <span className='ml-0.5 text-text-warning'>*</span>
              </div>
              <Input
                value={name}
                placeholder={t('workflow.workflowMeta.namePlaceholder')}
                onChange={handleNameChange}
                destructive={nameError}
              />
            </div>
            <div className='flex flex-col gap-y-1'>
              <div className='system-sm-semibold flex h-6 items-center text-text-secondary'>
                {t('workflow.workflowMeta.goal')}
                <span className='ml-0.5 text-text-warning'>*</span>
              </div>
              <textarea
                className={cn(
                  'system-sm-regular placeholder:system-sm-regular block h-24 w-full resize-none appearance-none rounded-lg border border-transparent bg-components-input-bg-normal p-2 text-components-input-text-filled caret-primary-600 outline-none placeholder:text-components-input-text-placeholder hover:border-components-input-border-hover hover:bg-components-input-bg-hover focus:border-components-input-border-active focus:bg-components-input-bg-active focus:shadow-xs',
                  goalError && 'border-text-warning bg-state-destructive-hover focus:border-text-warning',
                )}
                value={goal}
                placeholder={t('workflow.workflowMeta.goalPlaceholder')}
                onChange={handleGoalChange}
              />
            </div>
          </div>
        </div>
        <div className='flex shrink-0 justify-end p-6 pt-5'>
          <div className='flex items-center gap-x-2'>
            <Button onClick={onClose}>
              {t('common.operation.cancel')}
            </Button>
            <Button variant='primary' onClick={handleSave}>
              {t('common.operation.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowMetaModal
