/**
 * Agent Flow Data Adapter
 * Converts between workflow editor format and agent-flow API format
 */

import type {
  AgentFlowEdge,
  AgentFlowNode,
  AgentFlowWorkflow,
  CreateAgentFlowRequest,
} from './agent-flow'
import type {
  Edge,
  FetchWorkflowDraftResponse,
  Node,
} from '@/types/workflow'
import type { BlockEnum } from '@/app/components/workflow/types'

// ==================== Validation ====================

/**
 * Validate that workflow has exactly one start and one end node
 */
export const validateWorkflowStructure = (nodes: Node[]): { valid: boolean; error?: string } => {
  const startNodes = nodes.filter(node => node.data.type === 'start')
  const endNodes = nodes.filter(node => node.data.type === 'end')

  if (startNodes.length === 0) {
    return { valid: false, error: 'Workflow must have exactly one START node' }
  }
  if (startNodes.length > 1) {
    return { valid: false, error: 'Workflow must have exactly one START node (found multiple)' }
  }
  if (endNodes.length === 0) {
    return { valid: false, error: 'Workflow must have exactly one END node' }
  }
  if (endNodes.length > 1) {
    return { valid: false, error: 'Workflow must have exactly one END node (found multiple)' }
  }

  return { valid: true }
}

// ==================== Node Type Mapping ====================

/**
 * Map workflow editor node type to agent-flow node type
 */
const mapNodeTypeToAgentFlow = (type: BlockEnum): string => {
  const mapping: Record<string, string> = {
    start: 'start',
    end: 'end',
    message: 'message',
    llm: 'message',
    'question-classifier': 'router',
    'if-else': 'router',
    answer: 'message',
    'slot-filling': 'slot_filling',
  }
  return mapping[type] || 'message'
}

/**
 * Map agent-flow node type to workflow editor node type
 */
const mapNodeTypeFromAgentFlow = (type: string): BlockEnum => {
  const mapping: Record<string, BlockEnum> = {
    start: 'start',
    end: 'end',
    message: 'message',
    router: 'if-else',
    slot_filling: 'slot-filling',
  }
  return mapping[type] || 'message'
}

// ==================== Node Conversion ====================

/**
 * Convert workflow editor node to agent-flow node
 * Start and End nodes are simplified - they only need id and type
 */
const convertNodeToAgentFlow = (node: Node): AgentFlowNode => {
  const type = mapNodeTypeToAgentFlow(node.data.type)

  switch (type) {
    case 'start':
      // Start node only needs id and type
      return {
        id: node.id,
        type: 'start',
      }
    case 'end':
      // End node only needs id and type
      return {
        id: node.id,
        type: 'end',
      }
    case 'message':
      return {
        id: node.id,
        type: 'message',
        message: node.data.message || node.data.context?.value || node.data.prompt_template?.[0]?.text || '',
        mode: node.data.mode || 'llm',
        model: node.data.model
          ? {
              name: node.data.model.name || '',
              temperature: node.data.model.parameters?.temperature || node.data.model.temperature || 0,
            }
          : null,
      }
    case 'router':
      return {
        id: node.id,
        type: 'router',
        condition: node.data.conditions || node.data.condition || '',
        model: node.data.model
          ? {
              name: node.data.model.name || '',
              temperature: node.data.model.parameters?.temperature || 0,
            }
          : null,
      }
    case 'slot_filling':
      return {
        id: node.id,
        type: 'slot_filling',
        slot_name: node.data.slot_name || node.data.variable || '',
        question: node.data.question || node.data.prompt || '',
        model: {
          name: node.data.model?.name || 'gpt-4o-mini',
          temperature: node.data.model?.temperature || node.data.model?.parameters?.temperature || 0,
        },
        max_turns: node.data.max_turns || 3,
        validation: node.data.validation
          ? {
              criteria: node.data.validation.criteria || '',
              model: node.data.validation.model
                ? {
                    name: node.data.validation.model.name || '',
                    temperature: node.data.validation.model.temperature || node.data.validation.model.parameters?.temperature || 0,
                  }
                : null,
            }
          : null,
      }
    default:
      return {
        id: node.id,
        type: 'message',
        message: '',
      }
  }
}

/**
 * Convert agent-flow node to workflow editor node
 * Start and End nodes in agent-flow mode don't include variables/outputs fields
 */
const convertNodeFromAgentFlow = (agentNode: AgentFlowNode): Node => {
  const editorType = mapNodeTypeFromAgentFlow(agentNode.type)

  // Start node - minimal configuration without variables field
  // In agent-flow mode, Start is just a marker, not an input interface
  if (agentNode.type === 'start') {
    return {
      id: agentNode.id,
      data: {
        type: 'start',
        title: 'START',
        // Not including variables field - it's optional in StartNodeType
      },
      position: { x: 0, y: 0 },
    }
  }

  // End node - minimal configuration without outputs field
  // In agent-flow mode, End is just a marker, not an output interface
  if (agentNode.type === 'end') {
    return {
      id: agentNode.id,
      data: {
        type: 'end',
        title: 'END',
        // Not including outputs field - it's optional in EndNodeType
      },
      position: { x: 0, y: 0 },
    }
  }

  const baseNode: Node = {
    id: agentNode.id,
    data: {
      type: editorType,
      title: agentNode.type,
    },
    position: { x: 0, y: 0 },
  }

  switch (agentNode.type) {
    case 'message': {
      const messageNode = agentNode as any
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'message',
          title: 'Message',
          message: messageNode.message || '',
          mode: messageNode.mode || 'llm',
          model: messageNode.model
            ? {
                name: messageNode.model.name,
                temperature: messageNode.model.temperature || 0,
              }
            : undefined,
        },
      }
    }
    case 'router': {
      const routerNode = agentNode as any
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'if-else',
          title: 'Router',
          conditions: routerNode.condition || '',
          model: routerNode.model
            ? {
                name: routerNode.model.name,
                parameters: {
                  temperature: routerNode.model.temperature || 0,
                },
              }
            : undefined,
        },
      }
    }
    case 'slot_filling': {
      const slotNode = agentNode as any
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'slot-filling',
          title: 'Slot Filling',
          slot_name: slotNode.slot_name || '',
          question: slotNode.question || '',
          model: {
            name: slotNode.model.name,
            temperature: slotNode.model.temperature || 0,
          },
          max_turns: slotNode.max_turns || 3,
          validation: slotNode.validation
            ? {
                criteria: slotNode.validation.criteria,
                model: slotNode.validation.model
                  ? {
                      name: slotNode.validation.model.name,
                      temperature: slotNode.validation.model.temperature || 0,
                    }
                  : undefined,
              }
            : undefined,
        },
      }
    }
    default:
      return baseNode
  }
}

// ==================== Edge Conversion ====================

/**
 * Convert workflow editor edge to agent-flow edge
 */
const convertEdgeToAgentFlow = (edge: Edge): AgentFlowEdge => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }
}

/**
 * Convert agent-flow edge to workflow editor edge
 */
const convertEdgeFromAgentFlow = (agentEdge: AgentFlowEdge): Edge => {
  return {
    id: agentEdge.id,
    source: agentEdge.source,
    target: agentEdge.target,
    data: {},
  }
}

// ==================== Public API ====================

/**
 * Convert workflow editor data to agent-flow create request
 * Validates workflow structure before conversion
 */
export const workflowToAgentFlowCreate = (
  workflow: FetchWorkflowDraftResponse,
  options: {
    agentFlowId: string
    name: string
    goal: string
  },
): CreateAgentFlowRequest => {
  // Validate workflow structure
  const validation = validateWorkflowStructure(workflow.graph.nodes)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const nodes = workflow.graph.nodes.map(convertNodeToAgentFlow)
  const edges = workflow.graph.edges.map(convertEdgeToAgentFlow)

  return {
    agent_flow_id: options.agentFlowId,
    name: options.name,
    goal: options.goal,
    workflow: {
      nodes,
      edges,
    },
  }
}

/**
 * Convert workflow editor data to agent-flow workflow (for update)
 * Validates workflow structure before conversion
 */
export const workflowToAgentFlowWorkflow = (
  workflow: FetchWorkflowDraftResponse,
): AgentFlowWorkflow => {
  // Validate workflow structure
  const validation = validateWorkflowStructure(workflow.graph.nodes)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const nodes = workflow.graph.nodes.map(convertNodeToAgentFlow)
  const edges = workflow.graph.edges.map(convertEdgeToAgentFlow)

  return {
    nodes,
    edges,
  }
}

/**
 * Convert agent-flow data to workflow editor format
 */
export const agentFlowToWorkflow = (
  agentFlowWorkflow: AgentFlowWorkflow,
): Pick<FetchWorkflowDraftResponse, 'graph'> => {
  const nodes = agentFlowWorkflow.nodes.map(convertNodeFromAgentFlow)
  const edges = agentFlowWorkflow.edges.map(convertEdgeFromAgentFlow)

  return {
    graph: {
      nodes,
      edges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  }
}
