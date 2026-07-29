import { createHttpError } from '../../lib/errors.js'
import {
  listarEntrenamientosPorUsuario,
  buscarEntrenamientoPorId,
  asignarEntrenamiento as dbAsignarEntrenamiento,
  completarEntrenamiento,
  crearRegistroEjercicio,
  actualizarRegistroEjercicio,
} from '../../infrastructure/database/entrenamiento.database.js'
import { buscarPlantillaPorId } from '../../infrastructure/database/plantillaPlan.database.js'
import type { Entrenamiento, RegistroEjercicio } from '../types/entrenamiento.types.js'
import type { AsignarEntrenamientoInput } from '../types/entrenamiento.types.js'

export const obtenerEntrenamientosPorUsuario = (usuarioId: string): Promise<Entrenamiento[]> =>
  listarEntrenamientosPorUsuario(usuarioId)

export const obtenerEntrenamientoPorId = async (id: string, usuarioId: string, esAdmin: boolean): Promise<Entrenamiento> => {
  const entrenamiento = await buscarEntrenamientoPorId(id)
  if (!entrenamiento) throw createHttpError(404, 'Entrenamiento no encontrado')
  if (entrenamiento.usuarioId !== usuarioId && entrenamiento.asignadoPorId !== usuarioId && !esAdmin) {
    throw createHttpError(403, 'No tienes permiso para ver este entrenamiento')
  }
  return entrenamiento
}

export const asignarPlantillaAUsuario = async (
  asignadoPorId: string,
  data: AsignarEntrenamientoInput,
): Promise<Entrenamiento> => {
  if (!data.plantillaId) throw createHttpError(400, 'La plantilla es obligatoria')
  if (!data.usuarioId) throw createHttpError(400, 'El usuario es obligatorio')
  if (!data.fecha) throw createHttpError(400, 'La fecha es obligatoria')

  const plantilla = await buscarPlantillaPorId(data.plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')

  return dbAsignarEntrenamiento(data.plantillaId, data.usuarioId, asignadoPorId, new Date(data.fecha))
}

export const marcarEntrenamientoCompletado = async (id: string, usuarioId: string): Promise<void> => {
  const entrenamiento = await buscarEntrenamientoPorId(id)
  if (!entrenamiento) throw createHttpError(404, 'Entrenamiento no encontrado')
  if (entrenamiento.usuarioId !== usuarioId) throw createHttpError(403, 'Solo el entrenado puede marcar como completado')
  await completarEntrenamiento(id)
}

export const registrarResultadoEjercicio = async (
  ejercicioEntrenamientoId: string,
  _usuarioId: string,
  data: {
    completado?: boolean
    repeticionesReales?: number
    pesoReal?: number
    rpeReal?: number
    duracionReal?: number
    comentario?: string
  },
): Promise<RegistroEjercicio> =>
  crearRegistroEjercicio(ejercicioEntrenamientoId, data)

export const actualizarResultadoEjercicio = async (
  logId: string,
  _usuarioId: string,
  data: {
    completado?: boolean
    repeticionesReales?: number
    pesoReal?: number
    rpeReal?: number
    duracionReal?: number
    comentario?: string
  },
): Promise<RegistroEjercicio> =>
  actualizarRegistroEjercicio(logId, data)
