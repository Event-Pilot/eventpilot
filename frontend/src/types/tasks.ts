export type TaskMode = 'startup' | 'review' | 'handoff'

export type TaskStatus = 'generating' | 'ready' | 'error'

export type ResultSection = {
  id: string
  title: string
  summary: string
  items: string[]
  locked?: boolean
}

export type CreateTaskRequest = {
  mode: TaskMode
  activityName: string
  organizationName: string
  activityType?: string
  expectedParticipants?: string | number
  dateOrPeriod?: string
  location?: string
  budgetRange?: string
  targetAudience?: string
  extraContext?: string
  pastedMaterials?: string
}

export type CreateTaskResponse = {
  id: string
  status: TaskStatus
}

export type TaskPublic = {
  id: string
  mode: string
  activityName: string
  organizationName: string
  activityType: string | null
  expectedParticipants: number | null
  dateOrPeriod: string | null
  location: string | null
  budgetRange: string | null
  targetAudience: string | null
  extraContext: string | null
  pastedMaterials: string | null
  status: TaskStatus
  previewOutput: ResultSection[] | null
  fullOutput: ResultSection[] | null
  unlocked: boolean
  createdAt: string
  updatedAt: string
}
