export interface Usuario {
  id: string
  nombre: string
  correo: string
  creadoEn: Date
}

export interface CrearUsuarioInput {
  nombre: string
  correo: string
  contrasena: string
}
