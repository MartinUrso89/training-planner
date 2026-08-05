import api from './api'

export interface Vinculacion {
  id: string
  entrenadorId: string
  atletaId: string
  estado: 'Pendiente' | 'Activo' | 'Inactivo'
  creadoEn: string
  aceptadoEn: string | null
  actualizadoEn: string
  entrenador: { id: string; nombre: string; correo: string } | null
  atleta: { id: string; nombre: string; correo: string } | null
}

export const enviarSolicitud = (correo: string): Promise<Vinculacion> =>
  api.post<Vinculacion>('/vinculaciones', { correo }).then((r) => r.data)
