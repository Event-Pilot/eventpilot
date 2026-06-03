import { api } from '@/services/api'
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  TaskPublic,
} from '@/types/tasks'

export async function createTask(input: CreateTaskRequest): Promise<CreateTaskResponse> {
  const { data } = await api.post<CreateTaskResponse>('/api/tasks', input)
  return data
}

export async function getTask(id: string): Promise<TaskPublic> {
  const { data } = await api.get<TaskPublic>(`/api/tasks/${id}`)
  return data
}

export async function redeemTask(id: string, code: string): Promise<TaskPublic> {
  const { data } = await api.post<TaskPublic>(`/api/tasks/${id}/redeem`, { code })
  return data
}
