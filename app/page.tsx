import { redirect } from 'next/navigation'

export default function Home() {
  // Server-side redirect to new workflow editor
  redirect('/workflow-editor/new')
}
