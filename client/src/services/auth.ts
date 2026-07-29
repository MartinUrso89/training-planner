import api from './api'

export interface AuthUser {
  id: string
  nombre: string
  correo: string
  creadoEn: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const login = (payload: { correo: string; contrasena: string }): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/login', payload).then((r) => r.data)

export interface RegisterInput {
  nombre: string
  correo: string
  contrasena: string
}

export const register = (payload: RegisterInput): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/register', payload).then((r) => r.data)

export const fetchMe = (): Promise<AuthUser> =>
  api.get<AuthUser>('/auth/me').then((r) => r.data)
