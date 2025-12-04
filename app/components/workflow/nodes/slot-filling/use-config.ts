import { useCallback } from 'react'
import { produce } from 'immer'
import type { SlotFillingNodeType } from './types'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import { useNodesReadOnly } from '@/app/components/workflow/hooks'

const useConfig = (id: string, payload: SlotFillingNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { inputs, setInputs } = useNodeCrud<SlotFillingNodeType>(id, payload)

  const handleSlotNameChange = useCallback((slot_name: string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.slot_name = slot_name
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleQuestionChange = useCallback((question: string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.question = question
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleModelNameChange = useCallback((name: string) => {
    const newInputs = produce(inputs, (draft) => {
      if (!draft.model) {
        draft.model = { name: '', temperature: 0.0 }
      }
      draft.model.name = name
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleTemperatureChange = useCallback((temperature: number) => {
    const newInputs = produce(inputs, (draft) => {
      if (!draft.model) {
        draft.model = { name: '', temperature: 0.0 }
      }
      // Constrain to 0-1 range and round to 1 decimal place
      const bounded = Math.max(0, Math.min(1, temperature))
      draft.model.temperature = Math.round(bounded * 10) / 10
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleMaxTurnsChange = useCallback((max_turns: number) => {
    const newInputs = produce(inputs, (draft) => {
      draft.max_turns = Math.max(1, Math.min(10, max_turns))
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleValidationCriteriaChange = useCallback((criteria: string) => {
    const newInputs = produce(inputs, (draft) => {
      if (!draft.validation) {
        draft.validation = { criteria: '' }
      }
      draft.validation.criteria = criteria
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleValidationModelNameChange = useCallback((name: string) => {
    const newInputs = produce(inputs, (draft) => {
      if (!draft.validation) {
        draft.validation = { criteria: '' }
      }
      if (!draft.validation.model) {
        draft.validation.model = { name: '', temperature: 0.0 }
      }
      draft.validation.model.name = name
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleValidationTemperatureChange = useCallback((temperature: number) => {
    const newInputs = produce(inputs, (draft) => {
      if (!draft.validation) {
        draft.validation = { criteria: '' }
      }
      if (!draft.validation.model) {
        draft.validation.model = { name: '', temperature: 0.0 }
      }
      const bounded = Math.max(0, Math.min(1, temperature))
      draft.validation.model.temperature = Math.round(bounded * 10) / 10
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleToggleValidation = useCallback(() => {
    const newInputs = produce(inputs, (draft) => {
      if (draft.validation) {
        draft.validation = undefined
      } else {
        draft.validation = { criteria: '', model: undefined }
      }
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  return {
    readOnly,
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
  }
}

export default useConfig
