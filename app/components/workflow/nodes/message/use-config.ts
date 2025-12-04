import { useCallback } from 'react'
import { produce } from 'immer'
import type { MessageNodeType } from './types'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import { useNodesReadOnly } from '@/app/components/workflow/hooks'

const useConfig = (id: string, payload: MessageNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { inputs, setInputs } = useNodeCrud<MessageNodeType>(id, payload)

  const handleModeChange = useCallback((mode: 'llm' | 'strict') => {
    const newInputs = produce(inputs, (draft) => {
      draft.mode = mode
      // Reset model when switching to strict mode
      if (mode === 'strict') {
        draft.model = undefined
      }
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleMessageChange = useCallback((message: string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.message = message
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

  return {
    readOnly,
    inputs,
    handleModeChange,
    handleMessageChange,
    handleModelNameChange,
    handleTemperatureChange,
  }
}

export default useConfig
