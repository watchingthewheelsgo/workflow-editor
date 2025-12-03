/**
 * Workflow Hooks - Mock Implementation
 * All React Query hooks updated to use local mock services
 */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  FetchWorkflowDraftPageParams,
  FetchWorkflowDraftPageResponse,
  FetchWorkflowDraftResponse,
  NodeTracing,
  PublishWorkflowParams,
  UpdateWorkflowParams,
  VarInInspect,
  WorkflowConfigResponse,
} from '@/types/workflow'
import type { CommonResponse } from '@/models/common'
import { useInvalid, useReset } from './use-base'
import type { FlowType } from '@/types/common'
import * as MockService from './mock-workflow'

const NAME_SPACE = 'workflow'

export const useAppWorkflow = (appID: string) => {
  return useQuery<FetchWorkflowDraftResponse>({
    enabled: !!appID,
    queryKey: [NAME_SPACE, 'publish', appID],
    queryFn: () => MockService.fetchPublishedWorkflow(),
  })
}

export const useInvalidateAppWorkflow = () => {
  const queryClient = useQueryClient()
  return (appID: string) => {
    queryClient.invalidateQueries(
      {
        queryKey: [NAME_SPACE, 'publish', appID],
      })
  }
}

export const useWorkflowConfig = <T = WorkflowConfigResponse>(url: string, onSuccess: (v: T) => void) => {
  return useQuery({
    enabled: false, // Disabled - no backend API calls in standalone mode
    queryKey: [NAME_SPACE, 'config', url],
    staleTime: 0,
    queryFn: async () => {
      console.warn('[Mock] Workflow config query is disabled in standalone mode')
      // Return mock file upload config for '/files/upload'
      if (url === '/files/upload') {
        const mockConfig = {
          file_size_limit: 15,
          batch_count_limit: 5,
          image_file_size_limit: 10,
          video_file_size_limit: 100,
          audio_file_size_limit: 50,
        } as T
        onSuccess(mockConfig)
        return mockConfig
      }
      const data = await MockService.fetchWorkflowDraft() as T
      onSuccess(data)
      return data
    },
  })
}

const WorkflowVersionHistoryKey = [NAME_SPACE, 'versionHistory']

export const useWorkflowVersionHistory = (params: FetchWorkflowDraftPageParams) => {
  const { url, initialPage, limit, userId, namedOnly } = params
  return useInfiniteQuery({
    enabled: !!url,
    queryKey: [...WorkflowVersionHistoryKey, url, initialPage, limit, userId, namedOnly],
    queryFn: ({ pageParam = 1 }) => MockService.fetchWorkflowVersionHistory(pageParam, limit, userId, namedOnly),
    getNextPageParam: lastPage => lastPage.has_more ? lastPage.page + 1 : null,
    initialPageParam: initialPage,
  })
}

export const useResetWorkflowVersionHistory = () => {
  return useReset([...WorkflowVersionHistoryKey])
}

export const useUpdateWorkflow = () => {
  return useMutation({
    mutationKey: [NAME_SPACE, 'update'],
    mutationFn: (params: UpdateWorkflowParams) => {
      // Extract version ID from URL (simplified extraction)
      const versionId = params.url.split('/').pop() || ''
      return MockService.updateWorkflowVersion(versionId, params.title, params.releaseNotes)
    },
  })
}

export const useDeleteWorkflow = () => {
  return useMutation({
    mutationKey: [NAME_SPACE, 'delete'],
    mutationFn: (url: string) => {
      // Extract version ID from URL (simplified extraction)
      const versionId = url.split('/').pop() || ''
      return MockService.deleteWorkflowVersion(versionId)
    },
  })
}

export const usePublishWorkflow = () => {
  return useMutation({
    mutationKey: [NAME_SPACE, 'publish'],
    mutationFn: (params: PublishWorkflowParams) => MockService.publishWorkflow(params.title, params.releaseNotes),
  })
}

const useLastRunKey = [NAME_SPACE, 'last-run']
export const useLastRun = (flowType: FlowType, flowId: string, nodeId: string, enabled: boolean) => {
  return useQuery<NodeTracing>({
    enabled: false, // Disabled - no execution in standalone mode
    queryKey: [...useLastRunKey, flowType, flowId, nodeId],
    queryFn: async () => {
      console.warn('[Mock] Last run query is disabled in standalone mode')
      return null as any
    },
    retry: 0,
  })
}

export const useInvalidLastRun = (flowType: FlowType, flowId: string, nodeId: string) => {
  return useInvalid([...useLastRunKey, flowType, flowId, nodeId])
}

// Rerun workflow or change the version of workflow
export const useInvalidAllLastRun = (flowType?: FlowType, flowId?: string) => {
  return useInvalid([NAME_SPACE, flowType, 'last-run', flowId])
}

export const useConversationVarValues = (flowType?: FlowType, flowId?: string) => {
  return useQuery({
    enabled: !!flowId,
    queryKey: [NAME_SPACE, flowType, 'conversation var values', flowId],
    queryFn: async () => {
      return MockService.fetchConversationVarValues()
    },
  })
}

export const useInvalidateConversationVarValues = (flowType: FlowType, flowId: string) => {
  return useInvalid([NAME_SPACE, flowType, 'conversation var values', flowId])
}

export const useResetConversationVar = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'reset conversation var', flowId],
    mutationFn: async (varId: string) => {
      return MockService.resetConversationVar(varId)
    },
  })
}

export const useResetToLastRunValue = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'reset to last run value', flowId],
    mutationFn: async (varId: string): Promise<{ value: any }> => {
      return MockService.resetConversationVar(varId)
    },
  })
}

export const useSysVarValuesKey = [NAME_SPACE, 'sys-variable']
export const useSysVarValues = (flowType?: FlowType, flowId?: string) => {
  return useQuery({
    enabled: !!flowId,
    queryKey: [NAME_SPACE, flowType, 'sys var values', flowId],
    queryFn: async () => {
      return MockService.fetchSysVarValues()
    },
  })
}

export const useInvalidateSysVarValues = (flowType: FlowType, flowId: string) => {
  return useInvalid([NAME_SPACE, flowType, 'sys var values', flowId])
}

export const useDeleteAllInspectorVars = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'delete all inspector vars', flowId],
    mutationFn: async () => {
      return MockService.deleteAllInspectorVars()
    },
  })
}

export const useDeleteNodeInspectorVars = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'delete node inspector vars', flowId],
    mutationFn: async (nodeId: string) => {
      return MockService.deleteNodeInspectorVars(nodeId)
    },
  })
}

export const useDeleteInspectVar = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'delete inspector var', flowId],
    mutationFn: async (varId: string) => {
      return MockService.deleteInspectorVar(varId)
    },
  })
}

// edit the name or value of the inspector var
export const useEditInspectorVar = (flowType: FlowType, flowId: string) => {
  return useMutation({
    mutationKey: [NAME_SPACE, flowType, 'edit inspector var', flowId],
    mutationFn: async ({ varId, ...rest }: {
      varId: string
      name?: string
      value?: any
    }) => {
      return MockService.editInspectorVar(varId, rest.name, rest.value)
    },
  })
}
