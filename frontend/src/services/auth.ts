import { api } from '@/services/api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types/auth'

export async function login(input: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', input)
  return data
}

export async function register(input: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', input)
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me')
  return data
}
