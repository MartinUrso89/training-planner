import api from './api'

export interface EntrenamientoRealizado {
  id: string
  nombreRutina: string | null
  fecha: string
  completadoEn: string
  comentario: string | null
}

export interface ListarEntrenamientosRealizadosResultado {
  datos: EntrenamientoRealizado[]
  total: number
  pagina: number
  limite: number
}

export interface RutinaPendiente {
  id: string
  nombreRutina: string | null
  fecha: string
}

export interface ListarRutinasPendientesResultado {
  datos: RutinaPendiente[]
  total: number
  pagina: number
  limite: number
}

export interface RegistroEjercicio {
  id: string
  completado: boolean
  repeticionesReales: number | null
  pesoReal: number | null
  rpeReal: number | null
  duracionReal: number | null
  comentario: string | null
}

export interface EjercicioEntrenamiento {
  id: string
  orden: number
  seriesPrevistas: number | null
  repeticionesPrevistas: number | null
  duracionPrevista: number | null
  pesoPrevisto: number | null
  rpePrevisto: number | null
  descansoPrevisto: number | null
  notas: string | null
  ejercicio: { nombre: string }
  registros: RegistroEjercicio[]
}

export interface SeccionEntrenamiento {
  id: string
  nombre: string | null
  orden: number
  rondas: number | null
  tiempoLimite: number | null
  descansoEntreEjercicios: number | null
  descansoEntreRondas: number | null
  descansoEntreSecciones: number | null
  rondasCompletadas: number | null
  tiempoTotalReal: number | null
  ejercicios: EjercicioEntrenamiento[]
}

export interface EntrenamientoDetalle {
  id: string
  nombreRutina: string | null
  usuarioId: string
  asignadoPorId: string
  fecha: string
  completado: boolean
  completadoEn: string | null
  comentario: string | null
  secciones: SeccionEntrenamiento[]
}

export const obtenerEntrenamientosRealizados = (
  atletaId: string,
  filtros: { pagina: number; limite?: number },
): Promise<ListarEntrenamientosRealizadosResultado> =>
  api
    .get<ListarEntrenamientosRealizadosResultado>(`/entrenados/${atletaId}/entrenamientos`, {
      params: { pagina: filtros.pagina, limite: filtros.limite ?? 15 },
    })
    .then((r) => r.data)

export const obtenerEntrenamiento = (id: string): Promise<EntrenamientoDetalle> =>
  api.get<EntrenamientoDetalle>(`/entrenamientos/${id}`).then((r) => r.data)

export const obtenerRutinasPendientes = (
  atletaId: string,
  filtros: { pagina: number; limite?: number },
): Promise<ListarRutinasPendientesResultado> =>
  api
    .get<ListarRutinasPendientesResultado>(`/entrenados/${atletaId}/rutinas-pendientes`, {
      params: { pagina: filtros.pagina, limite: filtros.limite ?? 15 },
    })
    .then((r) => r.data)
