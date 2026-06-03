import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { NewTaskForm } from '@/components/dashboard/new-task-form'

export function DashboardNewPage() {
  return (
    <DashboardShell>
      <NewTaskForm />
    </DashboardShell>
  )
}
