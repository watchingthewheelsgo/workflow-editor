import type { FC } from 'react'
import { memo } from 'react'
import type { NodePanelProps } from '../../types'
import type { MessageNodeType } from './types'
import useConfig from './use-config'
import Field from '../_base/components/field'
import { useTranslation } from 'react-i18next'
import OutputVars, { VarItem } from '../_base/components/output-vars'
import Split from '../_base/components/split'
import Select from '@/app/components/base/select'
import Textarea from '@/app/components/base/textarea'
import Input from '@/app/components/base/input'
import { InputNumber } from '@/app/components/base/input-number'

const i18nPrefix = 'workflow.nodes.message'

const MessagePanel: FC<NodePanelProps<MessageNodeType>> = ({ id, data }) => {
  const { t } = useTranslation()

  const {
    inputs,
    handleModeChange,
    handleMessageChange,
    handleModelNameChange,
    handleTemperatureChange,
  } = useConfig(id, data)

  const modeOptions = [
    { value: 'strict', name: 'Strict Mode' },
    { value: 'llm', name: 'LLM Mode' },
  ]

  const modelOptions = [
    { value: 'gpt-4.1', name: 'gpt-4.1' },
    { value: 'gpt-5', name: 'gpt-5' },
  ]

  return (
    <div className='my-2'>
      {/* Mode Selection */}
      <Field
        required
        title={t(`${i18nPrefix}.mode`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.modeTip`)}
      >
        <Select
          defaultValue={inputs.mode || 'strict'}
          onSelect={(item) => handleModeChange(item.value as 'llm' | 'strict')}
          items={modeOptions}
          allowSearch={false}
        />
      </Field>

      {/* Message Content */}
      <Field
        required
        title={t(`${i18nPrefix}.message`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.messageTip`)}
      >
        <Textarea
          value={inputs.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder={t(`${i18nPrefix}.messagePlaceholder`)}
          className='h-24'
        />
      </Field>

      {/* LLM Mode - Model Configuration */}
      {inputs.mode === 'llm' && (
        <>
          <Split />
          <Field
            required
            title={t(`${i18nPrefix}.model`)}
            className='px-4 py-2'
            tooltip={t(`${i18nPrefix}.modelTip`)}
          >
            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-text-secondary mb-1'>
                  {t(`${i18nPrefix}.modelName`)}
                </label>
                <Select
                  defaultValue={inputs.model?.name || 'gpt-4.1'}
                  onSelect={(item) => handleModelNameChange(item.value as string)}
                  items={modelOptions}
                  allowSearch={false}
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-text-secondary mb-1'>
                  {t(`${i18nPrefix}.temperature`)}
                </label>
                <InputNumber
                  value={inputs.model?.temperature ?? 0}
                  onChange={handleTemperatureChange}
                  min={0}
                  max={1}
                  amount={0.1}
                  placeholder='0.0'
                />
              </div>
            </div>
          </Field>
        </>
      )}

      {/* Output Variables */}
      <Split />
      <div>
        <OutputVars>
          <VarItem
            name='text'
            type='String'
            description={t(`${i18nPrefix}.outputVars.text`)}
          />
          <VarItem
            name='mode'
            type='String'
            description={t(`${i18nPrefix}.outputVars.mode`)}
          />
          {inputs.mode === 'llm' && (
            <>
              <VarItem
                name='model'
                type='Object'
                description={t(`${i18nPrefix}.outputVars.model`)}
              />
              <VarItem
                name='tokens_used'
                type='Number'
                description={t(`${i18nPrefix}.outputVars.tokensUsed`)}
              />
            </>
          )}
        </OutputVars>
      </div>
    </div>
  )
}

MessagePanel.displayName = 'MessagePanel'

export default memo(MessagePanel)
