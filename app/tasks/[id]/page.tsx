import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PublicTaskResult } from '@/components/tasks/public-task-result'

export default function TaskResultPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal public header — same as /new */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" aria-label="EventPilot 首页">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-10">
        <PublicTaskResult />
      </main>
    </div>
  )
}
