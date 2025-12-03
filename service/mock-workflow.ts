/**
 * Mock Workflow Service - Local Storage Implementation
 * Replaces backend API calls with localStorage persistence
 */

import type {
  FetchWorkflowDraftResponse,
  NodesDefaultConfigsResponse,
  VarInInspect,
  WorkflowConfigResponse,
  FetchWorkflowDraftPageResponse,
} from '@/types/workflow'
import type { CommonResponse } from '@/models/common'
import type { BlockEnum } from '@/app/components/workflow/types'

// localStorage keys
const STORAGE_KEYS = {
  WORKFLOW_DRAFT: 'workflow-editor:draft',
  WORKFLOW_VERSIONS: 'workflow-editor:versions',
  CONVERSATION_VARS: 'workflow-editor:conversation-vars',
  SYSTEM_VARS: 'workflow-editor:system-vars',
  ALL_VARS: 'workflow-editor:all-vars',
}

// Helper functions for localStorage
const isBrowser = typeof window !== 'undefined'

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

const saveToStorage = <T>(key: string, value: T): void => {
  if (!isBrowser) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

// In-memory storage for workflow data (initialized from localStorage)
let workflowDraft: FetchWorkflowDraftResponse | null = loadFromStorage(STORAGE_KEYS.WORKFLOW_DRAFT, null)
let workflowVersions: Array<FetchWorkflowDraftResponse & { id: string; created_at: number; marked_name?: string; marked_comment?: string }> = loadFromStorage(STORAGE_KEYS.WORKFLOW_VERSIONS, [])
let conversationVars: VarInInspect[] = loadFromStorage(STORAGE_KEYS.CONVERSATION_VARS, [])
let systemVars: VarInInspect[] = loadFromStorage(STORAGE_KEYS.SYSTEM_VARS, [])
let allVars: VarInInspect[] = loadFromStorage(STORAGE_KEYS.ALL_VARS, [])

/**
 * Initialize with default empty workflow
 */
export const initializeWorkflow = (): FetchWorkflowDraftResponse => {
  const defaultWorkflow: FetchWorkflowDraftResponse = {
    graph: {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
    features: {
      file_upload: {
        enabled: false,
      },
      opening_statement: '',
      suggested_questions: [],
      suggested_questions_after_answer: {
        enabled: false,
      },
      text_to_speech: {
        enabled: false,
      },
      speech_to_text: {
        enabled: false,
      },
    },
    environment_variables: [],
    conversation_variables: [],
    created_by: '',
    created_at: Date.now(),
    updated_by: '',
    updated_at: Date.now(),
    hash: generateHash(),
  }

  workflowDraft = defaultWorkflow
  return defaultWorkflow
}

/**
 * Generate a random hash for version tracking
 */
const generateHash = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Fetch workflow draft (replaces fetchWorkflowDraft)
 */
export const fetchWorkflowDraft = async (): Promise<FetchWorkflowDraftResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!workflowDraft) {
    return initializeWorkflow()
  }

  return { ...workflowDraft }
}

/**
 * Sync workflow draft (replaces syncWorkflowDraft)
 */
export const syncWorkflowDraft = async (params: Pick<FetchWorkflowDraftResponse, 'graph' | 'features' | 'environment_variables' | 'conversation_variables'>): Promise<CommonResponse & { updated_at: number; hash: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  const now = Date.now()
  const newHash = generateHash()

  workflowDraft = {
    ...workflowDraft!,
    ...params,
    updated_at: now,
    hash: newHash,
  }

  // Save to localStorage
  saveToStorage(STORAGE_KEYS.WORKFLOW_DRAFT, workflowDraft)

  return {
    result: 'success',
    updated_at: now,
    hash: newHash,
  }
}

/**
 * Fetch node default configs (replaces fetchNodesDefaultConfigs)
 */
export const fetchNodesDefaultConfigs = async (blockType: BlockEnum): Promise<NodesDefaultConfigsResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  // Return empty config - nodes will use their built-in defaults
  return {}
}

/**
 * Fetch published workflow (replaces fetchPublishedWorkflow)
 */
export const fetchPublishedWorkflow = async (): Promise<FetchWorkflowDraftResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Return the latest version from history, or current draft
  if (workflowVersions.length > 0) {
    return { ...workflowVersions[0] }
  }

  return fetchWorkflowDraft()
}

/**
 * Publish workflow (replaces API call)
 */
export const publishWorkflow = async (title?: string, releaseNotes?: string): Promise<CommonResponse & { created_at: number }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!workflowDraft) {
    throw new Error('No workflow draft to publish')
  }

  const now = Date.now()
  const version = {
    ...workflowDraft,
    id: generateHash(),
    created_at: now,
    marked_name: title,
    marked_comment: releaseNotes,
  }

  // Add to beginning of versions array
  workflowVersions.unshift(version)

  // Save to localStorage
  saveToStorage(STORAGE_KEYS.WORKFLOW_VERSIONS, workflowVersions)

  return {
    result: 'success',
    created_at: now,
  }
}

/**
 * Fetch workflow version history (replaces API call)
 */
export const fetchWorkflowVersionHistory = async (page: number, limit: number, userId?: string, namedOnly?: boolean): Promise<FetchWorkflowDraftPageResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))

  let filteredVersions = [...workflowVersions]

  // Filter by named only if requested
  if (namedOnly) {
    filteredVersions = filteredVersions.filter(v => v.marked_name)
  }

  // Paginate
  const start = (page - 1) * limit
  const end = start + limit
  const pageData = filteredVersions.slice(start, end)

  return {
    data: pageData,
    has_more: end < filteredVersions.length,
    limit,
    page,
    total: filteredVersions.length,
  }
}

/**
 * Update workflow version (replaces API call)
 */
export const updateWorkflowVersion = async (versionId: string, title: string, releaseNotes: string): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  const version = workflowVersions.find(v => v.id === versionId)
  if (version) {
    version.marked_name = title
    version.marked_comment = releaseNotes
  }

  return { result: 'success' }
}

/**
 * Delete workflow version (replaces API call)
 */
export const deleteWorkflowVersion = async (versionId: string): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  workflowVersions = workflowVersions.filter(v => v.id !== versionId)

  return { result: 'success' }
}

/**
 * Fetch conversation variables (replaces API call)
 */
export const fetchConversationVarValues = async (): Promise<VarInInspect[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  return [...conversationVars]
}

/**
 * Fetch system variables (replaces API call)
 */
export const fetchSysVarValues = async (): Promise<VarInInspect[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  return [...systemVars]
}

/**
 * Fetch all inspect variables (replaces API call)
 */
export const fetchAllInspectVars = async (): Promise<VarInInspect[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  return [...allVars]
}

/**
 * Fetch node inspect variables (replaces API call)
 */
export const fetchNodeInspectVars = async (nodeId: string): Promise<VarInInspect[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  return allVars.filter(v => v.node_id === nodeId)
}

/**
 * Edit inspector variable (replaces API call)
 */
export const editInspectorVar = async (varId: string, name?: string, value?: any): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  const variable = allVars.find(v => v.id === varId)
  if (variable) {
    if (name !== undefined) variable.name = name
    if (value !== undefined) variable.value = value
  }

  // Update in conversation vars if exists
  const convVar = conversationVars.find(v => v.id === varId)
  if (convVar) {
    if (name !== undefined) convVar.name = name
    if (value !== undefined) convVar.value = value
  }

  return { result: 'success' }
}

/**
 * Delete inspector variable (replaces API call)
 */
export const deleteInspectorVar = async (varId: string): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  allVars = allVars.filter(v => v.id !== varId)
  conversationVars = conversationVars.filter(v => v.id !== varId)

  return { result: 'success' }
}

/**
 * Delete all inspector variables (replaces API call)
 */
export const deleteAllInspectorVars = async (): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  allVars = []
  conversationVars = []

  return { result: 'success' }
}

/**
 * Delete node inspector variables (replaces API call)
 */
export const deleteNodeInspectorVars = async (nodeId: string): Promise<CommonResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  allVars = allVars.filter(v => v.node_id !== nodeId)
  conversationVars = conversationVars.filter(v => v.node_id !== nodeId)

  return { result: 'success' }
}

/**
 * Reset conversation variable (replaces API call)
 */
export const resetConversationVar = async (varId: string): Promise<{ value: any }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50))

  const variable = conversationVars.find(v => v.id === varId)
  if (variable) {
    // Reset to default value (empty based on type)
    const defaultValue = getDefaultValueByType(variable.value_type)
    variable.value = defaultValue

    return { value: defaultValue }
  }

  return { value: null }
}

/**
 * Get default value by variable type
 */
const getDefaultValueByType = (type: string): any => {
  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

/**
 * Load workflow from JSON (for import functionality)
 */
export const loadWorkflowFromJSON = async (data: string): Promise<FetchWorkflowDraftResponse> => {
  try {
    const parsed = JSON.parse(data)
    workflowDraft = {
      ...parsed,
      created_at: Date.now(),
      updated_at: Date.now(),
      hash: generateHash(),
    }
    return workflowDraft
  } catch (error) {
    throw new Error('Invalid workflow JSON format')
  }
}

/**
 * Export workflow to JSON
 */
export const exportWorkflowToJSON = (): string => {
  if (!workflowDraft) {
    throw new Error('No workflow to export')
  }

  return JSON.stringify(workflowDraft, null, 2)
}

/**
 * Reset all data (for testing)
 */
export const resetAllData = () => {
  workflowDraft = null
  workflowVersions = []
  conversationVars = []
  systemVars = []
  allVars = []
}
