/**
 * Test file for agent-flow adapter validation
 * Run with: node --loader ts-node/esm test-agent-flow-adapter.ts
 */

import { validateWorkflowStructure } from './agent-flow-adapter'
import type { Node } from '@/types/workflow'

// Test Case 1: Valid workflow with exactly one start and one end
const validWorkflow: Node[] = [
  {
    id: '1',
    data: { type: 'start', title: 'START' },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    data: { type: 'answer', title: 'Message' },
    position: { x: 100, y: 0 },
  },
  {
    id: '3',
    data: { type: 'end', title: 'END' },
    position: { x: 200, y: 0 },
  },
]

// Test Case 2: No start node
const noStartWorkflow: Node[] = [
  {
    id: '2',
    data: { type: 'answer', title: 'Message' },
    position: { x: 100, y: 0 },
  },
  {
    id: '3',
    data: { type: 'end', title: 'END' },
    position: { x: 200, y: 0 },
  },
]

// Test Case 3: Multiple start nodes
const multipleStartWorkflow: Node[] = [
  {
    id: '1',
    data: { type: 'start', title: 'START' },
    position: { x: 0, y: 0 },
  },
  {
    id: '1b',
    data: { type: 'start', title: 'START' },
    position: { x: 0, y: 100 },
  },
  {
    id: '3',
    data: { type: 'end', title: 'END' },
    position: { x: 200, y: 0 },
  },
]

// Test Case 4: No end node
const noEndWorkflow: Node[] = [
  {
    id: '1',
    data: { type: 'start', title: 'START' },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    data: { type: 'answer', title: 'Message' },
    position: { x: 100, y: 0 },
  },
]

// Test Case 5: Multiple end nodes
const multipleEndWorkflow: Node[] = [
  {
    id: '1',
    data: { type: 'start', title: 'START' },
    position: { x: 0, y: 0 },
  },
  {
    id: '3',
    data: { type: 'end', title: 'END' },
    position: { x: 200, y: 0 },
  },
  {
    id: '3b',
    data: { type: 'end', title: 'END' },
    position: { x: 200, y: 100 },
  },
]

// Run tests
console.log('Testing workflow validation...\n')

console.log('Test 1: Valid workflow')
console.log(validateWorkflowStructure(validWorkflow))
console.log('Expected: { valid: true }\n')

console.log('Test 2: No start node')
console.log(validateWorkflowStructure(noStartWorkflow))
console.log('Expected: { valid: false, error: "Workflow must have exactly one START node" }\n')

console.log('Test 3: Multiple start nodes')
console.log(validateWorkflowStructure(multipleStartWorkflow))
console.log('Expected: { valid: false, error: "Workflow must have exactly one START node (found multiple)" }\n')

console.log('Test 4: No end node')
console.log(validateWorkflowStructure(noEndWorkflow))
console.log('Expected: { valid: false, error: "Workflow must have exactly one END node" }\n')

console.log('Test 5: Multiple end nodes')
console.log(validateWorkflowStructure(multipleEndWorkflow))
console.log('Expected: { valid: false, error: "Workflow must have exactly one END node (found multiple)" }\n')
