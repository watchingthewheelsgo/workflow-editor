import { useCallback } from 'react'
import { useStoreApi } from 'reactflow'
import { useWorkflowStore } from '@/app/components/workflow/store'

export const useAutoOnboarding = () => {
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()

  const checkAndShowOnboarding = useCallback(() => {
    // Disabled in standalone mode - no onboarding dialog
    return
  }, [])

  const handleOnboardingClose = useCallback(() => {
    const {
      setShowOnboarding,
      setHasShownOnboarding,
      setShouldAutoOpenStartNodeSelector,
      hasSelectedStartNode,
      setHasSelectedStartNode,
    } = workflowStore.getState()
    setShowOnboarding?.(false)
    setHasShownOnboarding?.(true)
    if (hasSelectedStartNode)
      setHasSelectedStartNode?.(false)
    else
      setShouldAutoOpenStartNodeSelector?.(false)
  }, [workflowStore])

  // Disabled in standalone mode
  // useEffect removed

  return {
    checkAndShowOnboarding,
    handleOnboardingClose,
  }
}
