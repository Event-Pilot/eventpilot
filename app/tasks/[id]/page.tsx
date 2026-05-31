import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PublicTaskResult } from '@/components/tasks/public-task-result'
import { StaticDemoTaskResult } from '@/components/tasks/static-demo-task-result'

type Params = Promise<{ id: string }>

export default async function TaskResultPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" aria-label="EventPilot 首页">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-10">
        {id === 'demo' ? (
          <StaticDemoTaskResult />
        ) : (
          <PublicTaskResult taskId={id} />
        )}
      </main>
    </div>
  )
}
