import { createHttpError } from '../../lib/errors.js'
import {
  listarEjerciciosPaginado,
  buscarEjercicioPorId,
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio,
  listarGruposMusculares,
  crearSugerenciaEjercicio,
  listarSugerenciasEjercicio,
} from '../../infrastructure/database/ejercicio.database.js'
import type { Ejercicio, SugerenciaEjercicio } from '../types/ejercicio.types.js'
import type { CrearEjercicioInput, ActualizarEjercicioInput, CrearSugerenciaEjercicioInput } from '../types/ejercicio.types.js'
import type { FiltrosEjercicio, ResultadoPaginado } from '../../infrastructure/database/ejercicio.database.js'

export const obtenerEjercicios = async (
  filtros: FiltrosEjercicio,
  pagina: number,
  limite: number,
): Promise<ResultadoPaginado> => {
  const pag = Math.max(1, Math.floor(pagina))
  const lim = Math.max(1, Math.min(100, Math.floor(limite)))
  return listarEjerciciosPaginado(filtros, pag, lim)
}

export const obtenerEjercicioPorId = async (id: string): Promise<Ejercicio> => {
  const ejercicio = await buscarEjercicioPorId(id)
  if (!ejercicio) throw createHttpError(404, 'Ejercicio no encontrado')
  return ejercicio
}

export const crearNuevoEjercicio = (usuarioId: string, data: CrearEjercicioInput): Promise<Ejercicio> => {
  if (!data.nombre?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  if (!data.musculoPrincipal?.trim()) throw createHttpError(400, 'El músculo principal es obligatorio')
  if (!data.tipoArticular) throw createHttpError(400, 'El tipo articular es obligatorio')
  if (!data.patronMovimiento) throw createHttpError(400, 'El patrón de movimiento es obligatorio')
  return crearEjercicio(usuarioId, data)
}

export const actualizarEjercicioExistente = async (id: string, usuarioId: string, data: ActualizarEjercicioInput): Promise<Ejercicio> => {
  const existente = await buscarEjercicioPorId(id)
  if (!existente) throw createHttpError(404, 'Ejercicio no encontrado')
  if (existente.creadoPor !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar este ejercicio')
  return actualizarEjercicio(id, data)
}

export const eliminarEjercicioExistente = async (id: string, usuarioId: string): Promise<void> => {
  const existente = await buscarEjercicioPorId(id)
  if (!existente) throw createHttpError(404, 'Ejercicio no encontrado')
  if (existente.creadoPor !== usuarioId) throw createHttpError(403, 'No tienes permiso para eliminar este ejercicio')
  await eliminarEjercicio(id)
}

export const obtenerGruposMusculares = async (): Promise<string[]> => {
  const resultados = await listarGruposMusculares()
  return resultados.map((r) => r.musculoPrincipal)
}

export const sugerirNuevoEjercicio = (usuarioId: string, data: CrearSugerenciaEjercicioInput): Promise<SugerenciaEjercicio> => {
  if (!data.nombre?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  if (!data.musculoPrincipal?.trim()) throw createHttpError(400, 'El músculo principal es obligatorio')
  if (!data.tipoArticular) throw createHttpError(400, 'El tipo articular es obligatorio')
  if (!data.patronMovimiento) throw createHttpError(400, 'El patrón de movimiento es obligatorio')
  return crearSugerenciaEjercicio(usuarioId, data)
}

export const obtenerSugerenciasEjercicio = async (): Promise<SugerenciaEjercicio[]> =>
  listarSugerenciasEjercicio()
