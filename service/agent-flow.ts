/**
 * Agent Flow API Service
 * Handles communication with the agent-flow backend API
 */

// API Configuration
const getApiBaseUrl = () => {
  // If environment variable is explicitly set, use it
  if (process.env.NEXT_PUBLIC_AGENT_FLOW_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_AGENT_FLOW_API_BASE_URL
  }

  // In production, use the production API
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.alignon.ai'
  }

  // In development, use localhost
  return 'http://localhost:8000'
}

const API_BASE_URL = getApiBaseUrl()
const API_PREFIX = '/api/v2'

// ==================== Types ====================

/**
 * Workflow structure matching backend API
 */
export interface AgentFlowWorkflow {
  nodes: AgentFlowNode[]
  edges: AgentFlowEdge[]
}

/**
 * Node types supported by backend
 */
export type AgentFlowNode =
  | MessageNode
  | SlotFillingNode
  | RouterNode
  | StartNode
  | EndNode

export interface MessageNode {
  id: string
  type: 'message'
  message: string
  mode?: 'llm' | 'strict'
  model?: ModelConfig | null
}

export interface SlotFillingNode {
  id: string
  type: 'slot_filling'
  slot_name: string
  question: string
  model: ModelConfig
  max_turns?: number
  validation?: ValidationConfig | null
}

export interface RouterNode {
  id: string
  type: 'router'
  condition: string
  model?: ModelConfig | null
}

export interface StartNode {
  id: string
  type: 'start'
}

export interface EndNode {
  id: string
  type: 'end'
}

export interface AgentFlowEdge {
  id: string
  source: string
  target: string
}

export interface ModelConfig {
  name: string
  temperature?: number
}

export interface ValidationConfig {
  criteria: string
  model?: ModelConfig | null
}

/**
 * Agent Flow data structure
 */
export interface AgentFlowData {
  id?: number
  agent_flow_id: string
  name: string
  goal: string
  workflow: AgentFlowWorkflow
  created_at?: string
  updated_at?: string
}

/**
 * Create agent flow request
 */
export interface CreateAgentFlowRequest {
  agent_flow_id: string
  name: string
  goal: string
  workflow: AgentFlowWorkflow
}

/**
 * Update agent flow request
 */
export interface UpdateAgentFlowRequest {
  name?: string
  goal?: string
  workflow?: AgentFlowWorkflow
}

/**
 * Agent flow response
 */
export interface AgentFlowResponse extends AgentFlowData {
  id: number
  created_at: string
  updated_at: string
}

/**
 * Agent flow list response
 */
export interface AgentFlowListResponse {
  items: AgentFlowSummary[]
  total_count: number
}

export interface AgentFlowSummary {
  id: number
  agent_flow_id: string
  name: string
  goal: string
  created_at: string
  updated_at: string
}

// ==================== API Functions ====================

/**
 * Create a new agent flow
 */
export const createAgentFlow = async (data: CreateAgentFlowRequest): Promise<AgentFlowResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agent-flows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create agent flow' }))
    throw new Error(error.message || `HTTP ${response.status}: Failed to create agent flow`)
  }

  return response.json()
}

/**
 * Get a specific agent flow by ID
 */
export const getAgentFlow = async (agentFlowId: string): Promise<AgentFlowResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agent-flows/${agentFlowId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch agent flow' }))
    throw new Error(error.message || `HTTP ${response.status}: Failed to fetch agent flow`)
  }

  return response.json()
}

/**
 * Update an existing agent flow
 */
export const updateAgentFlow = async (
  agentFlowId: string,
  data: UpdateAgentFlowRequest,
): Promise<AgentFlowResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agent-flows/${agentFlowId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update agent flow' }))
    throw new Error(error.message || `HTTP ${response.status}: Failed to update agent flow`)
  }

  return response.json()
}

/**
 * Delete an agent flow
 */
export const deleteAgentFlow = async (agentFlowId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agent-flows/${agentFlowId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete agent flow' }))
    throw new Error(error.message || `HTTP ${response.status}: Failed to delete agent flow`)
  }
}

/**
 * List all agent flows
 */
export const listAgentFlows = async (params?: {
  limit?: number
  offset?: number
  search?: string
}): Promise<AgentFlowListResponse> => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.offset) searchParams.append('offset', params.offset.toString())
  if (params?.search) searchParams.append('search', params.search)

  const url = `${API_BASE_URL}${API_PREFIX}/agent-flows${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to list agent flows' }))
    throw new Error(error.message || `HTTP ${response.status}: Failed to list agent flows`)
  }

  return response.json()
}

/**
 * Generate a unique agent flow ID
 */
export const generateAgentFlowId = (): string => {
  return `agent_flow_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
