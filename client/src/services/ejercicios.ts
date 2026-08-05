import api from './api'
import { env } from '../lib/envConfig'

export interface Ejercicio {
  id: string
  nombre: string
  musculoPrincipal: string
  musculoSecundario: string | null
  tipoArticular: string
  patronMovimiento: string
  imagenUrl: string | null
  videoUrl: string | null
  descripcion: string | null
  creadoPor: string
  creadoEn: string
}

export const urlImagenEjercicio = (imagenUrl: string | null): string | null =>
  imagenUrl ? `${env.VITE_API_URL}${imagenUrl}` : null

export const obtenerUrlIncrustable = (videoUrl: string | null): string | null => {
  if (!videoUrl) return null
  const url = videoUrl.trim()
  if (!url) return null

  const yaIncrustado = url.match(/^https?:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\/([\w-]+)/)
  if (yaIncrustado) return `https://www.youtube-nocookie.com/embed/${yaIncrustado[3]}`

  const extractor = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]+)/)
  if (extractor) return `https://www.youtube-nocookie.com/embed/${extractor[1]}`

  return null
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
