import api from './api'
import type { AuthUser } from './auth'

export interface Ejercicio {
  id: string
  nombre: string
  musculoPrincipal: string
  musculoSecundario: string | null
  tipoArticular: string
  patronMovimiento: string
  videoUrl: string | null
  descripcion: string | null
  creadoPor: string
  creadoEn: string
}

export interface ResultadoPaginado {
  datos: Ejercicio[]
  total: number
  pagina: number
  totalPaginas: number
}

export interface FiltrosEjercicio {
  buscar?: string
  musculoPrincipal?: string
  tipoArticular?: string
  patronMovimiento?: string
}

export interface SugerenciaInput {
  nombre: string
  musculoPrincipal: string
  musculoSecundario?: string
  tipoArticular: string
  patronMovimiento: string
  videoUrl?: string
  descripcion?: string
}

export const obtenerEjercicios = (filtros: FiltrosEjercicio, pagina: number, limite: number): Promise<ResultadoPaginado> =>
  api.get<ResultadoPaginado>('/ejercicios', {
    params: { ...filtros, pagina, limite },
  }).then((r) => r.data)

export const obtenerGruposMusculares = (): Promise<string[]> =>
  api.get<string[]>('/ejercicios/grupos-musculares').then((r) => r.data)

export const sugerirEjercicio = (data: SugerenciaInput): Promise<unknown> =>
  api.post('/ejercicios/sugerir', data).then((r) => r.data)
