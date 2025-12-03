/**
 * Workflow Service - Mock Implementation
 * All API calls replaced with local in-memory mock services
 */
import type { Fetcher } from 'swr'
import type { CommonResponse } from '@/models/common'
import type {
  ChatRunHistoryResponse,
  ConversationVariableResponse,
  FetchWorkflowDraftResponse,
  NodesDefaultConfigsResponse,
  WorkflowRunHistoryResponse,
} from '@/types/workflow'
import type { BlockEnum } from '@/app/components/workflow/types'
import type { VarInInspect } from '@/types/workflow'
import type { FlowType } from '@/types/common'
import * as MockService from './mock-workflow'

// ==================== WORKFLOW DRAFT ====================

export const fetchWorkflowDraft = (url: string) => {
  return MockService.fetchWorkflowDraft() as Promise<FetchWorkflowDraftResponse>
}

export const syncWorkflowDraft = ({ url, params }: {
  url: string
  params: Pick<FetchWorkflowDraftResponse, 'graph' | 'features' | 'environment_variables' | 'conversation_variables'>
}) => {
  return MockService.syncWorkflowDraft(params)
}

// ==================== NODE CONFIGS ====================

export const fetchNodesDefaultConfigs: Fetcher<NodesDefaultConfigsResponse, string> = (url) => {
  return MockService.fetchNodesDefaultConfigs('') as Promise<NodesDefaultConfigsResponse>
}

export const fetchNodeDefault = (appId: string, blockType: BlockEnum, query = {}) => {
  return MockService.fetchNodesDefaultConfigs(blockType)
}

export const fetchPipelineNodeDefault = (pipelineId: string, blockType: BlockEnum, query = {}) => {
  return MockService.fetchNodesDefaultConfigs(blockType)
}

// ==================== WORKFLOW EXECUTION (DISABLED) ====================
// These functions are disabled as per requirements (no backend execution)

export const fetchWorkflowRunHistory: Fetcher<WorkflowRunHistoryResponse, string> = (url) => {
  console.warn('[Mock] Workflow run history is disabled')
  return Promise.resolve({ data: [], has_more: false, limit: 10, page: 1, total: 0 } as WorkflowRunHistoryResponse)
}

export const fetchChatRunHistory: Fetcher<ChatRunHistoryResponse, string> = (url) => {
  console.warn('[Mock] Chat run history is disabled')
  return Promise.resolve({ data: [], has_more: false, limit: 10, page: 1, total: 0 } as ChatRunHistoryResponse)
}

export const singleNodeRun = (flowType: FlowType, flowId: string, nodeId: string, params: object) => {
  console.warn('[Mock] Single node run is disabled')
  return Promise.reject(new Error('Node execution is disabled in standalone mode'))
}

export const getIterationSingleNodeRunUrl = (flowType: FlowType, isChatFlow: boolean, flowId: string, nodeId: string) => {
  return '' // Return empty string as execution is disabled
}

export const getLoopSingleNodeRunUrl = (flowType: FlowType, isChatFlow: boolean, flowId: string, nodeId: string) => {
  return '' // Return empty string as execution is disabled
}

export const stopWorkflowRun = (url: string) => {
  console.warn('[Mock] Stop workflow run is disabled')
  return Promise.resolve({ result: 'success' } as CommonResponse)
}

// ==================== PUBLISHED WORKFLOW ====================

export const fetchPublishedWorkflow: Fetcher<FetchWorkflowDraftResponse, string> = (url) => {
  return MockService.fetchPublishedWorkflow()
}

// ==================== WORKFLOW IMPORT ====================

export const updateWorkflowDraftFromDSL = (appId: string, data: string) => {
  return MockService.loadWorkflowFromJSON(data)
}

// ==================== CONVERSATION VARIABLES ====================

export const fetchCurrentValueOfConversationVariable: Fetcher<ConversationVariableResponse, {
  url: string
  params: { conversation_id: string }
}> = ({ url, params }) => {
  console.warn('[Mock] Conversation variable fetch is disabled')
  return Promise.resolve({ data: [] } as ConversationVariableResponse)
}

// ==================== INSPECTOR VARIABLES ====================

export const fetchAllInspectVars = async (flowType: FlowType, flowId: string): Promise<VarInInspect[]> => {
  return MockService.fetchAllInspectVars()
}

export const fetchNodeInspectVars = async (flowType: FlowType, flowId: string, nodeId: string): Promise<VarInInspect[]> => {
  return MockService.fetchNodeInspectVars(nodeId)
}
