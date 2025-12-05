'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useStore as useAppStore } from '@/app/components/app/store'
import WorkflowApp from '@/app/components/workflow-app'
import Loading from '@/app/components/base/loading'
import { AppModeEnum } from '@/types/app'

const EditAgentFlowPage = () => {
  const params = useParams()
  const agentFlowId = params.agent_flow_id as string

  const setAppDetail = useAppStore(s => s.setAppDetail)
  const appDetail = useAppStore(s => s.appDetail)

  useEffect(() => {
    // Initialize app detail for editing existing agent flow
    setAppDetail({
      id: agentFlowId,
      name: `Agent Flow: ${agentFlowId}`,
      description: 'Edit agent flow',
      mode: AppModeEnum.WORKFLOW,
      model_config: {},
      created_at: Date.now(),
      updated_at: Date.now(),
      icon: '🎨',
      icon_background: '#3B82F6',
      enable_site: false,
      enable_api: false,
      api_rpm: 0,
      api_rph: 0,
      is_demo: false,
      is_public: false,
      is_universal: false,
      status: 'normal',
      use_icon_as_answer_icon: false,
    })
  }, [setAppDetail, agentFlowId])

  // Wait for appDetail to be initialized
  if (!appDetail) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className='h-screen w-screen overflow-hidden'>
      <WorkflowApp />
    </div>
  )
}

export default EditAgentFlowPage
