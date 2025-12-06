import {
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useEdges } from 'reactflow'
import { usePathname, useRouter } from 'next/navigation'
import { RiApps2AddLine, RiSettings4Line } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import {
  useStore,
  useWorkflowStore,
} from '@/app/components/workflow/store'
import {
  useChecklist,
  useChecklistBeforePublish,
  useNodesReadOnly,
  useNodesSyncDraft,
  // useWorkflowRunValidation,
} from '@/app/components/workflow/hooks'
import Button from '@/app/components/base/button'
import AppPublisher from '@/app/components/app/app-publisher'
import { useFeatures } from '@/app/components/base/features/hooks'
import type {
  CommonEdgeType,
  Node,
} from '@/app/components/workflow/types'
import {
  BlockEnum,
  InputVarType,
  isTriggerNode,
} from '@/app/components/workflow/types'
import { useToastContext } from '@/app/components/base/toast'
import { useInvalidateAppWorkflow, usePublishWorkflow, useResetWorkflowVersionHistory } from '@/service/use-workflow'
import { useInvalidateAppTriggers } from '@/service/use-tools'
import type { PublishWorkflowParams } from '@/types/workflow'
import { fetchAppDetail } from '@/service/apps'
import { useStore as useAppStore } from '@/app/components/app/store'
import useTheme from '@/hooks/use-theme'
import cn from '@/utils/classnames'
import { useIsChatMode } from '@/app/components/workflow/hooks'
import type { StartNodeType } from '@/app/components/workflow/nodes/start/types'
import type { EndNodeType } from '@/app/components/workflow/nodes/end/types'
import { useProviderContext } from '@/context/provider-context'
import { Plan } from '@/app/components/billing/type'
import useNodes from '@/app/components/workflow/store/workflow/use-nodes'
import { createAgentFlow, updateAgentFlow, generateAgentFlowId } from '@/service/agent-flow'
import { workflowToAgentFlowCreate, workflowToAgentFlowWorkflow } from '@/service/agent-flow-adapter'
import WorkflowMetaModal from './workflow-meta-modal'

const FeaturesTrigger = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const isChatMode = useIsChatMode()
  const workflowStore = useWorkflowStore()
  const appDetail = useAppStore(s => s.appDetail)
  const appID = appDetail?.id
  const setAppDetail = useAppStore(s => s.setAppDetail)
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly()
  const { plan, isFetchedPlan } = useProviderContext()
  const publishedAt = useStore(s => s.publishedAt)
  const draftUpdatedAt = useStore(s => s.draftUpdatedAt)

  // Workflow Meta state
  const [showWorkflowMeta, setShowWorkflowMeta] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowGoal, setWorkflowGoal] = useState('')

  // Detect agent-flow mode
  const isAgentFlowMode = pathname.startsWith('/workflow-editor/')
  const isNewAgentFlow = pathname === '/workflow-editor/new'
  const agentFlowId = !isNewAgentFlow && isAgentFlowMode ? appID : null

  const nodes = useNodes()
  const hasWorkflowNodes = nodes.length > 0
  const startNode = nodes.find(node => node.data.type === BlockEnum.Start)
  const endNode = nodes.find(node => node.data.type === BlockEnum.End)
  // Start and End nodes no longer have variables/outputs fields
  // They are just markers
  const edges = useEdges<CommonEdgeType>()

  const fileSettings = useFeatures(s => s.features.file)
  // Start node no longer has variables field
  // In agent-flow mode, workflows don't need input variables
  const variables = useMemo(() => {
    const data: any[] = []
    if (fileSettings?.image?.enabled) {
      return [
        ...data,
        {
          type: InputVarType.files,
          variable: '__image',
          required: false,
          label: 'files',
        },
      ]
    }

    return data
  }, [fileSettings?.image?.enabled])

  const { handleCheckBeforePublish } = useChecklistBeforePublish()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const { notify } = useToastContext()
  const startNodeIds = useMemo(
    () => nodes.filter(node => node.data.type === BlockEnum.Start).map(node => node.id),
    [nodes],
  )
  const hasUserInputNode = useMemo(() => {
    if (!startNodeIds.length)
      return false
    return edges.some(edge => startNodeIds.includes(edge.source))
  }, [edges, startNodeIds])
  // Track trigger presence so the publisher can adjust UI (e.g. hide missing start section).
  const hasTriggerNode = useMemo(() => (
    nodes.some(node => isTriggerNode(node.data.type as BlockEnum))
  ), [nodes])
  const startNodeLimitExceeded = useMemo(() => {
    const entryCount = nodes.reduce((count, node) => {
      const nodeType = node.data.type as BlockEnum
      if (nodeType === BlockEnum.Start || isTriggerNode(nodeType))
        return count + 1
      return count
    }, 0)
    return isFetchedPlan && plan.type === Plan.sandbox && entryCount > 2
  }, [nodes, plan.type, isFetchedPlan])

  const resetWorkflowVersionHistory = useResetWorkflowVersionHistory()
  const invalidateAppTriggers = useInvalidateAppTriggers()

  const handleShowFeatures = useCallback(() => {
    const {
      showFeaturesPanel,
      isRestoring,
      setShowFeaturesPanel,
    } = workflowStore.getState()
    if (getNodesReadOnly() && !isRestoring)
      return
    setShowFeaturesPanel(!showFeaturesPanel)
  }, [workflowStore, getNodesReadOnly])

  const updateAppDetail = useCallback(async () => {
    try {
      const res = await fetchAppDetail({ url: '/apps', id: appID! })
      setAppDetail({ ...res })
    }
    catch (error) {
      console.error(error)
    }
  }, [appID, setAppDetail])

  const { mutateAsync: publishWorkflow } = usePublishWorkflow()
  // const { validateBeforeRun } = useWorkflowRunValidation()
  const needWarningNodes = useChecklist(nodes, edges)

  const updatePublishedWorkflow = useInvalidateAppWorkflow()
  const onPublish = useCallback(async (params?: PublishWorkflowParams) => {
    // Check if name and goal are set
    if (!workflowName.trim()) {
      notify({ type: 'error', message: t('workflow.workflowMeta.nameRequired') })
      setShowWorkflowMeta(true)
      throw new Error('Workflow name is required')
    }
    if (!workflowGoal.trim()) {
      notify({ type: 'error', message: t('workflow.workflowMeta.goalRequired') })
      setShowWorkflowMeta(true)
      throw new Error('Workflow goal is required')
    }

    // Check if we're in agent-flow mode
    if (isAgentFlowMode) {
      // Agent Flow Mode: Create or update agent flow
      try {
        if (needWarningNodes.length > 0) {
          notify({ type: 'error', message: t('workflow.panel.checklistTip') })
          throw new Error('Checklist has unresolved items')
        }

        // Get current workflow data - use nodes and edges from hooks
        const currentNodes = nodes
        const currentEdges = edges

        // Build workflow draft response format
        const now = Math.floor(Date.now() / 1000)
        const workflowData = {
          id: appID!,
          graph: {
            nodes: currentNodes,
            edges: currentEdges,
            viewport: { x: 0, y: 0, zoom: 1 },
          },
          features: {},
          created_at: now,
          updated_at: now,
          created_by: { id: '', name: '', email: '' },
          updated_by: { id: '', name: '', email: '' },
          hash: '',
          tool_published: false,
          environment_variables: [],
          conversation_variables: [],
          version: '1.0',
          marked_name: '',
          marked_comment: '',
        }

        if (isNewAgentFlow) {
          // Create new agent flow
          console.log('[Agent Flow] Creating new agent flow')
          const agentFlowId = generateAgentFlowId()
          const createRequest = workflowToAgentFlowCreate(workflowData, {
            agentFlowId,
            name: workflowName || params?.title || 'New Agent Flow',
            goal: workflowGoal || params?.releaseNotes || 'Agent flow created from workflow editor',
          })

          const result = await createAgentFlow(createRequest)
          console.log('[Agent Flow] Created successfully:', result.agent_flow_id)

          notify({ type: 'success', message: t('common.api.actionSuccess') })

          // Redirect to edit page
          router.push(`/workflow-editor/${result.agent_flow_id}`)
        }
        else if (agentFlowId) {
          // Update existing agent flow
          console.log('[Agent Flow] Updating agent flow:', agentFlowId)
          const workflow = workflowToAgentFlowWorkflow(workflowData)

          await updateAgentFlow(agentFlowId, {
            name: workflowName || params?.title,
            goal: workflowGoal || params?.releaseNotes,
            workflow,
          })

          console.log('[Agent Flow] Updated successfully')
          notify({ type: 'success', message: t('common.api.actionSuccess') })
          // Update the published time (use current time in seconds)
          const nowInSeconds = Math.floor(Date.now() / 1000)
          workflowStore.getState().setPublishedAt(nowInSeconds)
        }
      }
      catch (error: any) {
        console.error('[Agent Flow] Publish error:', error)
        notify({ type: 'error', message: error.message || 'Failed to publish agent flow' })
        throw error
      }
      return
    }

    // Legacy mode: Original publish logic
    // First check if there are any items in the checklist
    // if (!validateBeforeRun())
    //   throw new Error('Checklist has unresolved items')

    if (needWarningNodes.length > 0) {
      notify({ type: 'error', message: t('workflow.panel.checklistTip') })
      throw new Error('Checklist has unresolved items')
    }

    // Then perform the detailed validation
    if (await handleCheckBeforePublish()) {
      const res = await publishWorkflow({
        url: `/apps/${appID}/workflows/publish`,
        title: params?.title || '',
        releaseNotes: params?.releaseNotes || '',
      })

      if (res) {
        notify({ type: 'success', message: t('common.api.actionSuccess') })
        updatePublishedWorkflow(appID!)
        updateAppDetail()
        invalidateAppTriggers(appID!)
        workflowStore.getState().setPublishedAt(res.created_at)
        workflowStore.getState().setLastPublishedHasUserInput(hasUserInputNode)
        resetWorkflowVersionHistory()
      }
    }
    else {
      throw new Error('Checklist failed')
    }
  }, [
    isAgentFlowMode,
    isNewAgentFlow,
    agentFlowId,
    needWarningNodes,
    nodes,
    edges,
    handleCheckBeforePublish,
    publishWorkflow,
    notify,
    appID,
    t,
    updatePublishedWorkflow,
    updateAppDetail,
    workflowStore,
    resetWorkflowVersionHistory,
    invalidateAppTriggers,
    hasUserInputNode,
    router,
    workflowName,
    workflowGoal,
  ])

  const onPublisherToggle = useCallback((state: boolean) => {
    if (state)
      handleSyncWorkflowDraft(true)
  }, [handleSyncWorkflowDraft])

  const handleWorkflowMetaSave = useCallback((params: { name: string; goal: string }) => {
    setWorkflowName(params.name)
    setWorkflowGoal(params.goal)
    notify({ type: 'success', message: t('common.api.actionSuccess') })
  }, [notify, t])

  return (
    <>
      {/* Feature button is only visible in chatflow mode (advanced-chat) */}
      {isChatMode && (
        <Button
          className={cn(
            'text-components-button-secondary-text',
            theme === 'dark' && 'rounded-lg border border-black/5 bg-white/10 backdrop-blur-sm',
          )}
          onClick={handleShowFeatures}
        >
          <RiApps2AddLine className='mr-1 h-4 w-4 text-components-button-secondary-text' />
          {t('workflow.common.features')}
        </Button>
      )}
      {/* Workflow Meta button */}
      <Button
        className={cn(
          'text-components-button-secondary-text',
          theme === 'dark' && 'rounded-lg border border-black/5 bg-white/10 backdrop-blur-sm',
        )}
        onClick={() => setShowWorkflowMeta(true)}
      >
        <RiSettings4Line className='mr-1 h-4 w-4 text-components-button-secondary-text' />
        {t('workflow.workflowMeta.button')}
      </Button>
      <AppPublisher
        {...{
          publishedAt,
          draftUpdatedAt,
          disabled: nodesReadOnly || !hasWorkflowNodes,
          onPublish,
          onToggle: onPublisherToggle,
          crossAxisOffset: 4,
          missingStartNode: !startNode,
          hasTriggerNode,
          startNodeLimitExceeded,
          publishDisabled: !hasWorkflowNodes || startNodeLimitExceeded,
        }}
      />
      <WorkflowMetaModal
        isOpen={showWorkflowMeta}
        onClose={() => setShowWorkflowMeta(false)}
        onSave={handleWorkflowMetaSave}
        initialName={workflowName}
        initialGoal={workflowGoal}
      />
    </>
  )
}

export default memo(FeaturesTrigger)
