import type { RolUsuario } from './vinculacion.types.js'

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: RolUsuario
  creadoEn: Date
}

export interface CrearUsuarioInput {
  nombre: string
  correo: string
  contrasena: string
  rol: RolUsuario
}
