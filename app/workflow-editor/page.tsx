'use client'
import { useEffect } from 'react'
import { useStore as useAppStore } from '@/app/components/app/store'
import WorkflowApp from '@/app/components/workflow-app'
import Loading from '@/app/components/base/loading'
import { AppModeEnum } from '@/types/app'

const WorkflowEditorPage = () => {
  const setAppDetail = useAppStore(s => s.setAppDetail)
  const appDetail = useAppStore(s => s.appDetail)

  useEffect(() => {
    // Initialize a standalone app detail for standalone workflow editor
    setAppDetail({
      id: 'standalone-workflow',
      name: 'Standalone Workflow Editor',
      description: 'A standalone workflow editor without backend',
      mode: AppModeEnum.WORKFLOW,
      model_config: {},
      created_at: Date.now(),
      updated_at: Date.now(),
      // Add other required fields with default values
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
  }, [setAppDetail])

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

export default WorkflowEditorPage
