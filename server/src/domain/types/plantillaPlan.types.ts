import type { Ejercicio } from './ejercicio.types.js'

export interface ConfiguracionTipoSeccion {
  usaRondas: boolean
  usaTiempoLimite: boolean
  usaDescansoEntreEjercicios: boolean
  usaDescansoEntreRondas: boolean
  usaDescansoEntreSeries: boolean
  usaDuracion: boolean
  usaPeso: boolean
  usaRpe: boolean
}

export interface TipoSeccion {
  id: string
  nombre: string
  configuracion: ConfiguracionTipoSeccion | null
}

export interface PlantillaPlan {
  id: string
  nombre: string
  descripcion: string | null
  usuarioId: string
  creadoEn: Date
  actualizadoEn: Date
  secciones: SeccionPlantilla[]
}

export interface SeccionPlantilla {
  id: string
  plantillaId: string
  tipoSeccionId: string
  nombre: string | null
  orden: number
  rondas: number | null
  tiempoLimite: number | null
  descansoEntreEjercicios: number | null
  descansoEntreRondas: number | null
  descansoEntreSecciones: number | null
  ejercicios: EjercicioPlantilla[]
}

export interface EjercicioPlantilla {
  id: string
  seccionPlantillaId: string
  ejercicioId: string
  orden: number
  series: number | null
  repeticiones: number | null
  duracionSegundos: number | null
  peso: number | null
  rpe: number | null
  descansoEntreSeries: number | null
  grupoSuperserieId: string | null
  ordenSuperserie: number | null
  notas: string | null
  ejercicio?: Ejercicio
}

export interface CrearPlantillaInput {
  nombre: string
  descripcion?: string
}

export interface CrearSeccionInput {
  tipoSeccionId: string
  nombre?: string
  orden: number
  rondas?: number
  tiempoLimite?: number
  descansoEntreEjercicios?: number
  descansoEntreRondas?: number
  descansoEntreSecciones?: number
}

export interface CrearEjercicioEnSeccionInput {
  ejercicioId: string
  orden: number
  series?: number
  repeticiones?: number
  duracionSegundos?: number
  peso?: number
  rpe?: number
  descansoEntreSeries?: number
  grupoSuperserieId?: string
  ordenSuperserie?: number
  notas?: string
}
