import { useParams } from 'react-router-dom'
import { PublicPageShell } from '@/components/public/public-page-shell'
import { PublicTaskResult } from '@/components/tasks/public-task-result'
import { StaticDemoTaskResult } from '@/components/tasks/static-demo-task-result'

export function TaskResultPage() {
  const { id = '' } = useParams()

  return (
    <PublicPageShell className="py-8 md:py-10">
      {id === 'demo' ? (
        <StaticDemoTaskResult />
      ) : (
        <PublicTaskResult taskId={id} />
      )}
    </PublicPageShell>
  )
}
