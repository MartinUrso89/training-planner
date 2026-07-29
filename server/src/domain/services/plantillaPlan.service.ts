import { createHttpError } from '../../lib/errors.js'
import {
  listarPlantillas,
  buscarPlantillaPorId,
  crearPlantilla,
  eliminarPlantilla,
  agregarSeccion,
  eliminarSeccion,
  agregarEjercicioASeccion,
  eliminarEjercicioDeSeccion,
  actualizarEjercicioEnSeccion,
} from '../../infrastructure/database/plantillaPlan.database.js'
import type { PlantillaPlan, SeccionPlantilla, EjercicioPlantilla } from '../types/plantillaPlan.types.js'
import type { CrearPlantillaInput, CrearSeccionInput, CrearEjercicioEnSeccionInput } from '../types/plantillaPlan.types.js'

export const obtenerPlantillas = (usuarioId: string): Promise<PlantillaPlan[]> =>
  listarPlantillas(usuarioId)

export const obtenerPlantillaPorId = async (id: string, usuarioId: string): Promise<PlantillaPlan> => {
  const plantilla = await buscarPlantillaPorId(id)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para ver esta plantilla')
  return plantilla
}

export const crearNuevaPlantilla = (usuarioId: string, data: CrearPlantillaInput): Promise<PlantillaPlan> => {
  if (!data.nombre?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  return crearPlantilla(usuarioId, data)
}

export const eliminarPlantillaExistente = async (id: string, usuarioId: string): Promise<void> => {
  const plantilla = await buscarPlantillaPorId(id)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para eliminar esta plantilla')
  await eliminarPlantilla(id)
}

export const agregarSeccionAPlantilla = async (plantillaId: string, usuarioId: string, data: CrearSeccionInput): Promise<SeccionPlantilla> => {
  const plantilla = await buscarPlantillaPorId(plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  return agregarSeccion(plantillaId, data)
}

export const eliminarSeccionDePlantilla = async (plantillaId: string, seccionId: string, usuarioId: string): Promise<void> => {
  const plantilla = await buscarPlantillaPorId(plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  await eliminarSeccion(seccionId)
}

export const agregarEjercicioASeccionPlantilla = async (
  plantillaId: string,
  seccionId: string,
  usuarioId: string,
  data: CrearEjercicioEnSeccionInput,
): Promise<EjercicioPlantilla> => {
  const plantilla = await buscarPlantillaPorId(plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  return agregarEjercicioASeccion(seccionId, data)
}

export const eliminarEjercicioDeSeccionPlantilla = async (
  plantillaId: string,
  ejercicioId: string,
  usuarioId: string,
): Promise<void> => {
  const plantilla = await buscarPlantillaPorId(plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  await eliminarEjercicioDeSeccion(ejercicioId)
}

export const actualizarEjercicioEnSeccionPlantilla = async (
  plantillaId: string,
  ejercicioId: string,
  usuarioId: string,
  data: Partial<CrearEjercicioEnSeccionInput>,
): Promise<EjercicioPlantilla> => {
  const plantilla = await buscarPlantillaPorId(plantillaId)
  if (!plantilla) throw createHttpError(404, 'Plantilla no encontrada')
  if (plantilla.usuarioId !== usuarioId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  return actualizarEjercicioEnSeccion(ejercicioId, data)
}
