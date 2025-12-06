import type { FC } from 'react'
import { memo } from 'react'
import type { NodePanelProps } from '../../types'
import type { RouterNodeType } from './types'
import useConfig from './use-config'
import Field from '../_base/components/field'
import { useTranslation } from 'react-i18next'
import OutputVars, { VarItem } from '../_base/components/output-vars'
import Split from '../_base/components/split'
import Select from '@/app/components/base/select'
import Textarea from '@/app/components/base/textarea'
import { InputNumber } from '@/app/components/base/input-number'
import { Switch } from '@headlessui/react'

const i18nPrefix = 'workflow.nodes.router'

const RouterPanel: FC<NodePanelProps<RouterNodeType>> = ({ id, data }) => {
  const { t } = useTranslation()

  const {
    inputs,
    handleConditionChange,
    handleModelNameChange,
    handleTemperatureChange,
    handleToggleModel,
  } = useConfig(id, data)

  const modelOptions = [
    { value: 'gpt-4.1', name: 'gpt-4.1' },
    { value: 'gpt-5', name: 'gpt-5' },
  ]

  return (
    <div className='my-2'>
      {/* Condition */}
      <Field
        required
        title={t(`${i18nPrefix}.condition`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.conditionTip`)}
      >
        <Textarea
          value={inputs.condition}
          onChange={(e) => handleConditionChange(e.target.value)}
          placeholder={t(`${i18nPrefix}.conditionPlaceholder`)}
          className='h-24'
        />
      </Field>

      {/* Model Configuration (Optional) */}
      <Split />
      <div className='px-4 py-2'>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium text-text-primary'>
            {t(`${i18nPrefix}.useModel`)}
          </label>
          <Switch
            checked={!!inputs.model}
            onChange={handleToggleModel}
            className={`${
              inputs.model ? 'bg-primary-600' : 'bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                inputs.model ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {inputs.model && (
        <Field
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
      )}

      {/* Output Variables */}
      <Split />
      <div>
        <OutputVars>
          <VarItem
            name='selected_branch'
            type='String'
            description={t(`${i18nPrefix}.outputVars.selectedBranch`)}
          />
          <VarItem
            name='condition_result'
            type='Boolean'
            description={t(`${i18nPrefix}.outputVars.conditionResult`)}
          />
        </OutputVars>
      </div>
    </div>
  )
}

RouterPanel.displayName = 'RouterPanel'

export default memo(RouterPanel)
