'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/app/components/base/loading'

const AppList = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to standalone workflow editor
    router.replace('/workflow-editor')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loading type='area' />
        <div className="mt-4 text-text-secondary">
          Redirecting to Workflow Editor...
        </div>
      </div>
    </div>
  )
}

export default AppList
