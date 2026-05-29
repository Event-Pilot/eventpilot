import Link from 'next/link'
import { ArrowUpRight, FileStack, Clock, CheckCircle2, Plus } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { tasks, statusLabels, statusStyles } from '@/lib/tasks'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Active tasks', value: '4', icon: FileStack },
  { label: 'In review', value: '1', icon: Clock },
  { label: 'Completed this term', value: '12', icon: CheckCircle2 },
]

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your event tasks, generations, and handoffs in one place.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="size-4" />
              New task
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8" id="library">
          <h2 className="text-sm font-medium text-foreground">Recent tasks</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {tasks.map((task, i) => (
              <Link
                key={task.id}
                href={`/result/${task.id}`}
                className={cn(
                  'group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50',
                  i !== 0 && 'border-t border-border',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        statusStyles[task.status],
                      )}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {task.type} · {task.owner} · {task.updated}
                  </p>
                </div>
                <div className="hidden w-32 sm:block">
                  <Progress value={task.progress} className="h-1.5" />
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
