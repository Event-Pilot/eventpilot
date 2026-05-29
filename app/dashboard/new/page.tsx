import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { NewTaskForm } from '@/components/dashboard/new-task-form'

export default function NewTaskPage() {
  return (
    <DashboardShell>
      <NewTaskForm />
    </DashboardShell>
  )
}
