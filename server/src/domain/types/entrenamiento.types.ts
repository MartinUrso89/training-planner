import type { Ejercicio } from './ejercicio.types.js'

export interface Entrenamiento {
  id: string
  plantillaId: string | null
  usuarioId: string
  asignadoPorId: string
  fecha: Date
  completado: boolean
  completadoEn: Date | null
  creadoEn: Date
  secciones: SeccionEntrenamiento[]
}

export interface SeccionEntrenamiento {
  id: string
  entrenamientoId: string
  tipoSeccionId: string
  nombre: string | null
  orden: number
  rondas: number | null
  tiempoLimite: number | null
  descansoEntreEjercicios: number | null
  descansoEntreRondas: number | null
  ejercicios: EjercicioEntrenamiento[]
}

export interface EjercicioEntrenamiento {
  id: string
  seccionEntrenamientoId: string
  ejercicioId: string
  orden: number
  seriesPrevistas: number | null
  repeticionesPrevistas: number | null
  duracionPrevista: number | null
  pesoPrevisto: number | null
  rpePrevisto: number | null
  descansoPrevisto: number | null
  grupoSuperserieId: string | null
  ordenSuperserie: number | null
  notas: string | null
  ejercicio?: Ejercicio
  registros: RegistroEjercicio[]
}

export interface RegistroEjercicio {
  id: string
  ejercicioEntrenamientoId: string
  completado: boolean
  repeticionesReales: number | null
  pesoReal: number | null
  rpeReal: number | null
  duracionReal: number | null
  comentario: string | null
  completadoEn: Date | null
}

export interface AsignarEntrenamientoInput {
  plantillaId: string
  usuarioId: string
  fecha: string
}
