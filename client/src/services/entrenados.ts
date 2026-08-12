import api from './api'

export type ObjetivoPrincipal = 'Fuerza' | 'Hipertrofia' | 'PerdidaDePeso' | 'Tonificacion' | 'Rendimiento'

export const OBJETIVO_ETIQUETAS: Record<ObjetivoPrincipal, string> = {
  Fuerza: 'Fuerza',
  Hipertrofia: 'Hipertrofia',
  PerdidaDePeso: 'Pérdida de peso',
  Tonificacion: 'Tonificación',
  Rendimiento: 'Rendimiento',
}

export interface Entrenado {
  vinculacionId: string
  atleta: { id: string; nombre: string; correo: string }
  estado: 'Pendiente' | 'Activo' | 'Inactivo'
  objetivoPrincipal: ObjetivoPrincipal | null
  diasPorSemana: number | null
  descripcion: string | null
  ultimoEntrenamiento: string | null
  rutinasPendientes: number
}

export interface PerfilEntrenado extends Entrenado {
  vinculadoDesde: string | null
  notasEntrenador: string | null
}

export interface GuardarPerfilInput {
  objetivoPrincipal?: ObjetivoPrincipal
  diasPorSemana?: number
  descripcion?: string
}

export interface ListarEntrenadosResultado {
  datos: Entrenado[]
  total: number
  pagina: number
  limite: number
}

export interface FiltrosEntrenados {
  busqueda?: string
  estado?: 'Pendiente' | 'Activo' | 'Inactivo'
  tienePendientes?: boolean
  pagina: number
  limite?: number
}

export const listarEntrenados = (filtros: FiltrosEntrenados): Promise<ListarEntrenadosResultado> =>
  api
    .get<ListarEntrenadosResultado>('/entrenados', {
      params: {
        busqueda: filtros.busqueda || undefined,
        estado: filtros.estado || undefined,
        tienePendientes: filtros.tienePendientes || undefined,
        pagina: filtros.pagina,
        limite: filtros.limite ?? 8,
      },
    })
    .then((r) => r.data)

export const obtenerEntrenado = (atletaId: string): Promise<PerfilEntrenado> =>
  api.get<PerfilEntrenado>(`/entrenados/${atletaId}`).then((r) => r.data)

export const guardarPerfilAtleta = (atletaId: string, datos: GuardarPerfilInput): Promise<{ ok: boolean }> =>
  api.put(`/entrenados/${atletaId}/perfil`, datos).then((r) => r.data)

export const guardarNotas = (atletaId: string, notas: string): Promise<{ ok: boolean }> =>
  api.put(`/entrenados/${atletaId}/notas`, { notas }).then((r) => r.data)
