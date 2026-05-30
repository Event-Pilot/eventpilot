import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PublicNewTaskForm } from '@/components/tasks/public-new-task-form'

export default function NewTaskPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal public header — logo only, no sidebar, no avatar, no nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" aria-label="EventPilot 首页">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-10">
        <PublicNewTaskForm />
      </main>
    </div>
  )
}
