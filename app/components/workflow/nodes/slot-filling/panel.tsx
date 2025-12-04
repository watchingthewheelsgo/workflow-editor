import type { FC } from 'react'
import { memo } from 'react'
import type { NodePanelProps } from '../../types'
import type { SlotFillingNodeType } from './types'
import useConfig from './use-config'
import Field from '../_base/components/field'
import { useTranslation } from 'react-i18next'
import OutputVars, { VarItem } from '../_base/components/output-vars'
import Split from '../_base/components/split'
import Select from '@/app/components/base/select'
import Textarea from '@/app/components/base/textarea'
import Input from '@/app/components/base/input'
import { InputNumber } from '@/app/components/base/input-number'
import { Switch } from '@headlessui/react'

const i18nPrefix = 'workflow.nodes.slotFilling'

const SlotFillingPanel: FC<NodePanelProps<SlotFillingNodeType>> = ({ id, data }) => {
  const { t } = useTranslation()

  const {
    inputs,
    handleSlotNameChange,
    handleQuestionChange,
    handleModelNameChange,
    handleTemperatureChange,
    handleMaxTurnsChange,
    handleValidationCriteriaChange,
    handleValidationModelNameChange,
    handleValidationTemperatureChange,
    handleToggleValidation,
  } = useConfig(id, data)

  const modelOptions = [
    { value: 'gpt-4.1', name: 'gpt-4.1' },
    { value: 'gpt-5', name: 'gpt-5' },
  ]

  return (
    <div className='my-2'>
      {/* Slot Name */}
      <Field
        required
        title={t(`${i18nPrefix}.slotName`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.slotNameTip`)}
      >
        <Input
          value={inputs.slot_name}
          onChange={(e) => handleSlotNameChange(e.target.value)}
          placeholder={t(`${i18nPrefix}.slotNamePlaceholder`)}
          maxLength={100}
        />
      </Field>

      {/* Question */}
      <Field
        required
        title={t(`${i18nPrefix}.question`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.questionTip`)}
      >
        <Textarea
          value={inputs.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={t(`${i18nPrefix}.questionPlaceholder`)}
          className='h-24'
        />
      </Field>

      {/* Model Configuration */}
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
              step={0.1}
              placeholder='0.0'
            />
          </div>
        </div>
      </Field>

      {/* Max Turns */}
      <Field
        required
        title={t(`${i18nPrefix}.maxTurns`)}
        className='px-4 py-2'
        tooltip={t(`${i18nPrefix}.maxTurnsTip`)}
      >
        <InputNumber
          value={inputs.max_turns ?? 3}
          onChange={handleMaxTurnsChange}
          min={1}
          max={10}
          step={1}
          placeholder='3'
        />
      </Field>

      {/* Validation Configuration (Optional) */}
      <Split />
      <div className='px-4 py-2'>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium text-text-primary'>
            {t(`${i18nPrefix}.validation`)}
          </label>
          <Switch
            checked={!!inputs.validation}
            onChange={handleToggleValidation}
            className={`${
              inputs.validation ? 'bg-primary-600' : 'bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                inputs.validation ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {inputs.validation && (
        <>
          <Field
            title={t(`${i18nPrefix}.validationCriteria`)}
            className='px-4 py-2'
            tooltip={t(`${i18nPrefix}.validationCriteriaTip`)}
          >
            <Textarea
              value={inputs.validation.criteria}
              onChange={(e) => handleValidationCriteriaChange(e.target.value)}
              placeholder={t(`${i18nPrefix}.validationCriteriaPlaceholder`)}
              className='h-20'
            />
          </Field>

          <Field
            title={t(`${i18nPrefix}.validationModel`)}
            className='px-4 py-2'
            tooltip={t(`${i18nPrefix}.validationModelTip`)}
          >
            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-text-secondary mb-1'>
                  {t(`${i18nPrefix}.modelName`)}
                </label>
                <Select
                  defaultValue={inputs.validation.model?.name || ''}
                  onSelect={(item) => handleValidationModelNameChange(item.value as string)}
                  items={modelOptions}
                  allowSearch={false}
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-text-secondary mb-1'>
                  {t(`${i18nPrefix}.temperature`)}
                </label>
                <InputNumber
                  value={inputs.validation.model?.temperature ?? 0}
                  onChange={handleValidationTemperatureChange}
                  min={0}
                  max={1}
                  step={0.1}
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
            name='filled_value'
            type='String'
            description={t(`${i18nPrefix}.outputVars.filledValue`)}
          />
          <VarItem
            name='turns_used'
            type='Number'
            description={t(`${i18nPrefix}.outputVars.turnsUsed`)}
          />
          <VarItem
            name='validation_passed'
            type='Boolean'
            description={t(`${i18nPrefix}.outputVars.validationPassed`)}
          />
        </OutputVars>
      </div>
    </div>
  )
}

SlotFillingPanel.displayName = 'SlotFillingPanel'

export default memo(SlotFillingPanel)
