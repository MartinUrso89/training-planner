import { createHttpError } from '../../lib/errors.js'
import { buscarPorCorreo, buscarUsuarioPorId } from '../../infrastructure/database/usuario.database.js'
import {
  crearVinculacion as dbCrearVinculacion,
  buscarVinculacionPorPar,
  buscarVinculacionPorId,
  listarVinculacionesPorEntrenador,
  listarVinculacionesPorAtleta,
  actualizarEstadoVinculacion,
  eliminarVinculacion as dbEliminarVinculacion,
} from '../../infrastructure/database/vinculacion.database.js'
import type { EstadoVinculacion, Vinculacion } from '../types/vinculacion.types.js'
import type { CrearVinculacionInput } from '../types/vinculacion.types.js'

export const crearVinculacion = async (entrenadorId: string, input: CrearVinculacionInput): Promise<Vinculacion> => {
  if (!input.correo?.trim()) throw createHttpError(400, 'El correo del atleta es obligatorio')

  const entrenador = await buscarUsuarioPorId(entrenadorId)
  if (!entrenador || entrenador.rol !== 'ENTRENADOR') throw createHttpError(403, 'Solo un entrenador puede enviar solicitudes')

  const atleta = await buscarPorCorreo(input.correo.trim())
  if (!atleta) throw createHttpError(404, 'No existe un usuario con ese correo')
  if (atleta.id === entrenadorId) throw createHttpError(400, 'No podés vincularte a vos mismo')
  if (atleta.rol !== 'ATLETA') throw createHttpError(400, 'Solo podés vincular atletas')

  const existente = await buscarVinculacionPorPar(entrenadorId, atleta.id)
  if (existente) {
    if (existente.estado === 'Activo') throw createHttpError(409, 'Ya estás vinculado a este atleta')
    if (existente.estado === 'Pendiente') throw createHttpError(409, 'Ya hay una solicitud pendiente')
    return actualizarEstadoVinculacion(existente.id, 'Pendiente')
  }

  return dbCrearVinculacion(entrenadorId, atleta.id)
}

export const listarVinculaciones = async (usuarioId: string, estado?: EstadoVinculacion): Promise<Vinculacion[]> => {
  const usuario = await buscarUsuarioPorId(usuarioId)
  if (!usuario) throw createHttpError(404, 'Usuario no encontrado')
  return usuario.rol === 'ENTRENADOR'
    ? listarVinculacionesPorEntrenador(usuarioId, estado)
    : listarVinculacionesPorAtleta(usuarioId, estado)
}

export const aceptarVinculacion = async (id: string, atletaId: string): Promise<Vinculacion> => {
  const vinculacion = await buscarVinculacionPorId(id)
  if (!vinculacion) throw createHttpError(404, 'Vinculación no encontrada')
  if (vinculacion.atletaId !== atletaId) throw createHttpError(403, 'Solo el atleta puede aceptar la solicitud')
  if (vinculacion.estado !== 'Pendiente') throw createHttpError(400, 'La vinculación no está pendiente')

  return actualizarEstadoVinculacion(id, 'Activo', new Date())
}

export const inactivarVinculacion = async (id: string, usuarioId: string): Promise<Vinculacion> => {
  const vinculacion = await buscarVinculacionPorId(id)
  if (!vinculacion) throw createHttpError(404, 'Vinculación no encontrada')
  if (vinculacion.entrenadorId !== usuarioId && vinculacion.atletaId !== usuarioId) {
    throw createHttpError(403, 'No tenés permiso para modificar esta vinculación')
  }
  if (vinculacion.estado !== 'Activo') throw createHttpError(400, 'Solo podés inactivar una vinculación activa')

  return actualizarEstadoVinculacion(id, 'Inactivo')
}

export const eliminarVinculacion = async (id: string, usuarioId: string): Promise<void> => {
  const vinculacion = await buscarVinculacionPorId(id)
  if (!vinculacion) throw createHttpError(404, 'Vinculación no encontrada')
  if (vinculacion.entrenadorId !== usuarioId && vinculacion.atletaId !== usuarioId) {
    throw createHttpError(403, 'No tenés permiso para eliminar esta vinculación')
  }
  if (vinculacion.estado === 'Activo') throw createHttpError(400, 'Inactivá la vinculación antes de eliminarla')

  await dbEliminarVinculacion(id)
}
