export type RolUsuario = 'ENTRENADOR' | 'ATLETA'

export type EstadoVinculacion = 'Pendiente' | 'Activo' | 'Inactivo'

export interface Vinculacion {
  id: string
  entrenadorId: string
  atletaId: string
  estado: EstadoVinculacion
  creadoEn: Date
  aceptadoEn: Date | null
  actualizadoEn: Date
  entrenador: {
    id: string
    nombre: string
    correo: string
  } | null
  atleta: {
    id: string
    nombre: string
    correo: string
  } | null
}

export interface CrearVinculacionInput {
  correo: string
}
