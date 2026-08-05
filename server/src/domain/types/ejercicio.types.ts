export type TipoArticular = 'Poliarticular' | 'Monoarticular'

export type PatronMovimiento =
  | 'Empuje'
  | 'Traccion'
  | 'DominanteRodilla'
  | 'DominanteCadera'
  | 'Rotacion'
  | 'Antirrotacion'
  | 'Flexion'
  | 'Extension'

export type EstadoSugerencia = 'Pendiente' | 'Aprobado' | 'Rechazado'

export interface Ejercicio {
  id: string
  nombre: string
  musculoPrincipal: string
  musculoSecundario: string | null
  tipoArticular: TipoArticular
  patronMovimiento: PatronMovimiento
  imagenUrl: string | null
  videoUrl: string | null
  descripcion: string | null
  creadoPor: string
  creadoEn: Date
}

export interface CrearEjercicioInput {
  nombre: string
  musculoPrincipal: string
  musculoSecundario?: string
  tipoArticular: TipoArticular
  patronMovimiento: PatronMovimiento
  imagenUrl?: string
  videoUrl?: string
  descripcion?: string
}

export interface ActualizarEjercicioInput {
  nombre?: string
  musculoPrincipal?: string
  musculoSecundario?: string | null
  tipoArticular?: TipoArticular
  patronMovimiento?: PatronMovimiento
  imagenUrl?: string | null
  videoUrl?: string
  descripcion?: string
}

export interface SugerenciaEjercicio {
  id: string
  nombre: string
  musculoPrincipal: string
  musculoSecundario: string | null
  tipoArticular: TipoArticular
  patronMovimiento: PatronMovimiento
  imagenUrl: string | null
  videoUrl: string | null
  descripcion: string | null
  sugeridoPor: string
  sugeridoEn: Date
  estado: EstadoSugerencia
  revisadoPor: string | null
  revisadoEn: Date | null
  comentarioRechazo: string | null
}

export interface CrearSugerenciaEjercicioInput {
  nombre: string
  musculoPrincipal: string
  musculoSecundario?: string
  tipoArticular: TipoArticular
  patronMovimiento: PatronMovimiento
  imagenUrl?: string
  videoUrl?: string
  descripcion?: string
}
