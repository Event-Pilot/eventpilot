import { PublicPageShell } from '@/components/public/public-page-shell'
import { PublicNewTaskForm } from '@/components/tasks/public-new-task-form'

export function NewTaskPage() {
  return (
    <PublicPageShell className="py-8 md:py-10">
      <PublicNewTaskForm />
    </PublicPageShell>
  )
}
