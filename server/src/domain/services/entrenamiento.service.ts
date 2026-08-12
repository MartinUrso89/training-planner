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
import { buscarUsuarioPorId } from '../../infrastructure/database/usuario.database.js'
import { existeVinculacionActiva } from '../../infrastructure/database/vinculacion.database.js'
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

  const asignador = await buscarUsuarioPorId(asignadoPorId)
  if (!asignador || asignador.rol !== 'ENTRENADOR') throw createHttpError(403, 'Solo un entrenador puede asignar rutinas')

  const atleta = await buscarUsuarioPorId(data.usuarioId)
  if (!atleta) throw createHttpError(404, 'Usuario no encontrado')
  if (atleta.rol !== 'ATLETA') throw createHttpError(400, 'Solo podés asignar rutinas a atletas')

  const vinculado = await existeVinculacionActiva(asignadoPorId, data.usuarioId)
  if (!vinculado) throw createHttpError(403, 'El atleta no está vinculado activamente')

  return dbAsignarEntrenamiento(data.plantillaId, data.usuarioId, asignadoPorId, new Date(data.fecha))
}

export const marcarEntrenamientoCompletado = async (
  id: string,
  usuarioId: string,
  comentario?: string,
): Promise<Entrenamiento> => {
  const entrenamiento = await buscarEntrenamientoPorId(id)
  if (!entrenamiento) throw createHttpError(404, 'Entrenamiento no encontrado')
  if (entrenamiento.usuarioId !== usuarioId) throw createHttpError(403, 'Solo el entrenado puede marcar como completado')
  const comentarioLimpio = comentario?.trim()
  return completarEntrenamiento(id, comentarioLimpio ? comentarioLimpio : undefined)
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
