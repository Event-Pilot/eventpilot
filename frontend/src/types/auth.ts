export type User = {
  id: number
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}
