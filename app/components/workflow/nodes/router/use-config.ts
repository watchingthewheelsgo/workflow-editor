import { useCallback } from 'react'
import { produce } from 'immer'
import type { RouterNodeType } from './types'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import { useNodesReadOnly } from '@/app/components/workflow/hooks'

const useConfig = (id: string, payload: RouterNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { inputs, setInputs } = useNodeCrud<RouterNodeType>(id, payload)

  const handleConditionChange = useCallback((condition: string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.condition = condition
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

  const handleToggleModel = useCallback(() => {
    const newInputs = produce(inputs, (draft) => {
      if (draft.model) {
        draft.model = undefined
      } else {
        draft.model = { name: 'gpt-4.1', temperature: 0.0 }
      }
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  return {
    readOnly,
    inputs,
    handleConditionChange,
    handleModelNameChange,
    handleTemperatureChange,
    handleToggleModel,
  }
}

export default useConfig
