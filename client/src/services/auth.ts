import api from './api'

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const login = (payload: { email: string; password: string }): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/login', payload).then((r) => r.data)

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export const register = (payload: RegisterInput): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/register', payload).then((r) => r.data)

export const fetchMe = (): Promise<AuthUser> =>
  api.get<AuthUser>('/auth/me').then((r) => r.data)
