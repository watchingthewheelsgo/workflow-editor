import {
  useCallback,
} from 'react'
import { useNodes } from 'reactflow'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import type { StartNodeType } from '../nodes/start/types'
import {
  useNodesInteractions,
  useWorkflowRun,
} from '../hooks'
import EditingTitle from './editing-title'
import VersionHistoryButton from './version-history-button'
import { useInputFieldPanel } from '@/app/components/rag-pipeline/hooks'
import ScrollToSelectedNodeButton from './scroll-to-selected-node-button'

export type HeaderInNormalProps = {
  components?: {
    left?: React.ReactNode
    middle?: React.ReactNode
    chatVariableTrigger?: React.ReactNode
  }
  runAndHistoryProps?: any // Keep type for compatibility but unused
}
const HeaderInNormal = ({
  components,
  runAndHistoryProps,
}: HeaderInNormalProps) => {
  const workflowStore = useWorkflowStore()
  const { handleNodeSelect } = useNodesInteractions()
  const setShowWorkflowVersionHistoryPanel = useStore(s => s.setShowWorkflowVersionHistoryPanel)
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const setShowDebugAndPreviewPanel = useStore(s => s.setShowDebugAndPreviewPanel)
  const setShowVariableInspectPanel = useStore(s => s.setShowVariableInspectPanel)
  const setShowChatVariablePanel = useStore(s => s.setShowChatVariablePanel)
  const setShowGlobalVariablePanel = useStore(s => s.setShowGlobalVariablePanel)
  const nodes = useNodes<StartNodeType>()
  const selectedNode = nodes.find(node => node.data.selected)
  const { handleBackupDraft } = useWorkflowRun()
  const { closeAllInputFieldPanels } = useInputFieldPanel()

  const onStartRestoring = useCallback(() => {
    workflowStore.setState({ isRestoring: true })
    handleBackupDraft()
    // clear right panel
    if (selectedNode)
      handleNodeSelect(selectedNode.id, true)
    setShowWorkflowVersionHistoryPanel(true)
    setShowEnvPanel(false)
    setShowDebugAndPreviewPanel(false)
    setShowVariableInspectPanel(false)
    setShowChatVariablePanel(false)
    setShowGlobalVariablePanel(false)
    closeAllInputFieldPanels()
  }, [workflowStore, handleBackupDraft, selectedNode, handleNodeSelect, setShowWorkflowVersionHistoryPanel, setShowEnvPanel, setShowDebugAndPreviewPanel, setShowVariableInspectPanel, setShowChatVariablePanel, setShowGlobalVariablePanel])

  return (
    <div className='flex w-full items-center justify-between'>
      <div>
        <EditingTitle />
      </div>
      <div>
        <ScrollToSelectedNodeButton />
      </div>
      <div className='flex items-center gap-2'>
        {/* Removed: RunAndHistory (test run, run history, checklist) */}
        {/* Removed: EnvButton (environment variables) */}
        {/* Removed: GlobalVariableButton */}
        {components?.middle}
        <VersionHistoryButton onClick={onStartRestoring} />
      </div>
    </div>
  )
}

export default HeaderInNormal
