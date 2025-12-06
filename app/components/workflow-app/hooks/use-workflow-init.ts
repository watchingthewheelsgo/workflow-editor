import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  useStore,
  useWorkflowStore,
} from '@/app/components/workflow/store'
import { useWorkflowTemplate } from './use-workflow-template'
import { useStore as useAppStore } from '@/app/components/app/store'
import {
  fetchNodesDefaultConfigs,
  fetchPublishedWorkflow,
  fetchWorkflowDraft,
  syncWorkflowDraft,
} from '@/service/workflow'
import { getAgentFlow } from '@/service/agent-flow'
import { agentFlowToWorkflow } from '@/service/agent-flow-adapter'
import type { FetchWorkflowDraftResponse } from '@/types/workflow'
import { useWorkflowConfig } from '@/service/use-workflow'
import type { FileUploadConfigResponse } from '@/models/common'
import type { Edge, Node } from '@/app/components/workflow/types'
import { BlockEnum } from '@/app/components/workflow/types'
import { AppModeEnum } from '@/types/app'

const hasConnectedUserInput = (nodes: Node[] = [], edges: Edge[] = []): boolean => {
  const startNodeIds = nodes
    .filter(node => node?.data?.type === BlockEnum.Start)
    .map(node => node.id)

  if (!startNodeIds.length)
    return false

  return edges.some(edge => startNodeIds.includes(edge.source))
}
export const useWorkflowInit = () => {
  const pathname = usePathname()
  const workflowStore = useWorkflowStore()
  const {
    nodes: nodesTemplate,
    edges: edgesTemplate,
  } = useWorkflowTemplate()
  const appDetail = useAppStore(state => state.appDetail)!
  const setSyncWorkflowDraftHash = useStore(s => s.setSyncWorkflowDraftHash)
  const [data, setData] = useState<FetchWorkflowDraftResponse>()
  const [isLoading, setIsLoading] = useState(true)
  const loadedAgentFlowIdRef = useRef<string | null>(null)

  // Detect if we're in agent-flow mode
  const isAgentFlowMode = pathname.startsWith('/workflow-editor/')
  const isNewAgentFlow = pathname === '/workflow-editor/new'
  const agentFlowId = !isNewAgentFlow && isAgentFlowMode ? appDetail.id : null

  useEffect(() => {
    workflowStore.setState({ appId: appDetail.id, appName: appDetail.name })
  }, [appDetail.id, workflowStore])

  const handleUpdateWorkflowFileUploadConfig = useCallback((config: FileUploadConfigResponse) => {
    const { setFileUploadConfig } = workflowStore.getState()
    setFileUploadConfig(config)
  }, [workflowStore])
  const {
    data: fileUploadConfigResponse,
    isLoading: isFileUploadConfigLoading,
  } = useWorkflowConfig('/files/upload', handleUpdateWorkflowFileUploadConfig)

  const handleGetInitialWorkflowData = useCallback(async () => {
    try {
      // Agent Flow Mode: Load from agent-flow backend
      if (isAgentFlowMode && !isNewAgentFlow && agentFlowId) {
        // Skip if we already loaded this agent flow
        if (loadedAgentFlowIdRef.current === agentFlowId) {
          console.log('[Agent Flow] Already loaded:', agentFlowId)
          return
        }

        console.log('[Agent Flow] Loading agent flow:', agentFlowId)
        setIsLoading(true)
        loadedAgentFlowIdRef.current = agentFlowId

        const agentFlowData = await getAgentFlow(agentFlowId)
        const convertedWorkflow = agentFlowToWorkflow(agentFlowData.workflow)

        const res: FetchWorkflowDraftResponse = {
          id: agentFlowData.agent_flow_id,
          graph: convertedWorkflow.graph,
          features: {},
          created_at: Math.floor(new Date(agentFlowData.created_at).getTime() / 1000),
          updated_at: Math.floor(new Date(agentFlowData.updated_at).getTime() / 1000),
          created_by: { id: '', name: '', email: '' },
          updated_by: { id: '', name: '', email: '' },
          hash: '',
          tool_published: false,
          environment_variables: [],
          conversation_variables: [],
          version: '1.0',
          marked_name: agentFlowData.name,
          marked_comment: agentFlowData.goal,
        }

        setData(res)
        workflowStore.setState({
          envSecrets: {},
          environmentVariables: [],
          conversationVariables: [],
          isWorkflowDataLoaded: true,
          shouldAutoLayout: true, // Auto-layout after loading agent flow
        })
        setIsLoading(false)
        return
      }

      // New Agent Flow Mode: Initialize with empty workflow
      if (isNewAgentFlow) {
        console.log('[Agent Flow] Initializing new agent flow')
        const now = Math.floor(Date.now() / 1000)
        const res: FetchWorkflowDraftResponse = {
          id: 'new-agent-flow',
          graph: {
            nodes: [],
            edges: [],
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

        setData(res)
        workflowStore.setState({
          envSecrets: {},
          environmentVariables: [],
          conversationVariables: [],
          isWorkflowDataLoaded: true,
          notInitialWorkflow: true,
        })
        setIsLoading(false)
        return
      }

      // Legacy Mode: Use mock workflow service
      const res = await fetchWorkflowDraft(`/apps/${appDetail.id}/workflows/draft`)
      setData(res)
      workflowStore.setState({
        envSecrets: (res.environment_variables || []).filter(env => env.value_type === 'secret').reduce((acc, env) => {
          acc[env.id] = env.value
          return acc
        }, {} as Record<string, string>),
        environmentVariables: res.environment_variables?.map(env => env.value_type === 'secret' ? { ...env, value: '[__HIDDEN__]' } : env) || [],
        conversationVariables: res.conversation_variables || [],
        isWorkflowDataLoaded: true,
      })
      setSyncWorkflowDraftHash(res.hash)
      setIsLoading(false)
    }
    catch (error: any) {
      console.error('[Workflow Init] Error loading workflow:', error)

      // Only handle draft_workflow_not_exist in legacy mode
      if (!isAgentFlowMode && error && error.json && !error.bodyUsed && appDetail) {
        error.json().then((err: any) => {
          if (err.code === 'draft_workflow_not_exist') {
            const isAdvancedChat = appDetail.mode === AppModeEnum.ADVANCED_CHAT
            workflowStore.setState({
              notInitialWorkflow: true,
              showOnboarding: false,
              shouldAutoOpenStartNodeSelector: false,
              hasShownOnboarding: true,
            })
            const nodesData = isAdvancedChat ? nodesTemplate : []
            const edgesData = isAdvancedChat ? edgesTemplate : []

            syncWorkflowDraft({
              url: `/apps/${appDetail.id}/workflows/draft`,
              params: {
                graph: {
                  nodes: nodesData,
                  edges: edgesData,
                },
                features: {
                  retriever_resource: { enabled: true },
                },
                environment_variables: [],
                conversation_variables: [],
              },
            }).then((res) => {
              workflowStore.getState().setDraftUpdatedAt(res.updated_at)
              handleGetInitialWorkflowData()
            })
          }
        })
      }
      else {
        // For agent flow mode errors, show error and keep loading state
        setIsLoading(false)
      }
    }
  }, [appDetail, nodesTemplate, edgesTemplate, workflowStore, setSyncWorkflowDraftHash, isAgentFlowMode, isNewAgentFlow, agentFlowId])

  useEffect(() => {
    handleGetInitialWorkflowData()
  }, []) // Only run once on mount

  // Separate effect to handle agentFlowId changes for reload
  useEffect(() => {
    // Only reload when agentFlowId changes in agent flow mode (not for new flows)
    if (isAgentFlowMode && !isNewAgentFlow && agentFlowId && loadedAgentFlowIdRef.current !== agentFlowId) {
      console.log('[Agent Flow] AgentFlowId changed, reloading:', agentFlowId)
      handleGetInitialWorkflowData()
    }
  }, [agentFlowId, isAgentFlowMode, isNewAgentFlow, handleGetInitialWorkflowData])

  const handleFetchPreloadData = useCallback(async () => {
    // Skip preload data for agent flow mode
    if (isAgentFlowMode) {
      console.log('[Agent Flow] Skipping preload data (not applicable for agent flow)')
      return
    }

    try {
      const nodesDefaultConfigsData = await fetchNodesDefaultConfigs(`/apps/${appDetail?.id}/workflows/default-workflow-block-configs`)
      const publishedWorkflow = await fetchPublishedWorkflow(`/apps/${appDetail?.id}/workflows/publish`)

      // nodesDefaultConfigsData is already an object, not an array
      workflowStore.setState({
        nodesDefaultConfigs: nodesDefaultConfigsData || {},
      })
      workflowStore.getState().setPublishedAt(publishedWorkflow?.created_at)
      const graph = publishedWorkflow?.graph
      workflowStore.getState().setLastPublishedHasUserInput(
        hasConnectedUserInput(graph?.nodes, graph?.edges),
      )
    }
    catch (e) {
      console.error(e)
      workflowStore.getState().setLastPublishedHasUserInput(false)
    }
  }, [workflowStore, appDetail, isAgentFlowMode])

  useEffect(() => {
    handleFetchPreloadData()
  }, [handleFetchPreloadData])

  useEffect(() => {
    if (data) {
      workflowStore.getState().setDraftUpdatedAt(data.updated_at)
      workflowStore.getState().setToolPublished(data.tool_published)

      // For agent flow mode, updated_at is also the published time
      // Agent flow doesn't have draft concept, every update is a publish
      if (isAgentFlowMode) {
        workflowStore.getState().setPublishedAt(data.updated_at)
      }
    }
  }, [data, workflowStore, isAgentFlowMode])

  return {
    data,
    isLoading: isLoading || isFileUploadConfigLoading,
    fileUploadConfigResponse,
  }
}
