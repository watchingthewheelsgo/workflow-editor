'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/app/components/base/loading'

const Home = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to standalone workflow editor
    router.replace('/workflow-editor')
  }, [router])

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Loading type='area' />
        <div className="mt-4 text-center text-text-secondary">
          Loading Workflow Editor...
        </div>
      </div>
    </div>
  )
}

export default Home
