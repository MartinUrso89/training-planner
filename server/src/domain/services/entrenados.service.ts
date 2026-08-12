import { createHttpError } from '../../lib/errors.js'
import { buscarUsuarioPorId } from '../../infrastructure/database/usuario.database.js'
import { existeVinculacionActiva } from '../../infrastructure/database/vinculacion.database.js'
import { listarEntrenados as dbListarEntrenados, obtenerEntrenado as dbObtenerEntrenado, guardarPerfilAtleta as dbGuardarPerfilAtleta, guardarNotasEntrenador as dbGuardarNotasEntrenador, listarEntrenamientosRealizados as dbListarEntrenamientosRealizados, listarRutinasPendientes as dbListarRutinasPendientes } from '../../infrastructure/database/entrenados.database.js'
import { OBJETIVOS_PRINCIPALES } from '../types/perfilAtleta.types.js'
import type { FiltrosEntrenados, GuardarNotasInput, GuardarPerfilAtletaInput, ListarEntrenadosResultado, PerfilEntrenado } from '../types/perfilAtleta.types.js'
import type { ListarEntrenamientosRealizadosResultado, ListarRutinasPendientesResultado } from '../types/entrenamiento.types.js'

const validarEntrenador = async (entrenadorId: string): Promise<void> => {
  const usuario = await buscarUsuarioPorId(entrenadorId)
  if (!usuario || usuario.rol !== 'ENTRENADOR') throw createHttpError(403, 'Solo un entrenador puede acceder a sus entrenados')
}

export const obtenerEntrenados = async (
  entrenadorId: string,
  filtros: FiltrosEntrenados,
): Promise<ListarEntrenadosResultado> => {
  await validarEntrenador(entrenadorId)

  if (filtros.estado && !['Pendiente', 'Activo', 'Inactivo'].includes(filtros.estado)) {
    throw createHttpError(400, 'Estado inválido')
  }

  return dbListarEntrenados(entrenadorId, filtros)
}

export const obtenerEntrenado = async (entrenadorId: string, atletaId: string): Promise<PerfilEntrenado> => {
  await validarEntrenador(entrenadorId)

  const perfil = await dbObtenerEntrenado(entrenadorId, atletaId)
  if (!perfil) throw createHttpError(404, 'El atleta no está vinculado')

  return perfil
}

export const obtenerEntrenamientosRealizados = async (
  entrenadorId: string,
  atletaId: string,
  filtros: { pagina?: number; limite?: number },
): Promise<ListarEntrenamientosRealizadosResultado> => {
  await validarEntrenador(entrenadorId)

  const perfil = await dbObtenerEntrenado(entrenadorId, atletaId)
  if (!perfil) throw createHttpError(404, 'El atleta no está vinculado')

  return dbListarEntrenamientosRealizados(entrenadorId, atletaId, filtros)
}

export const obtenerRutinasPendientes = async (
  entrenadorId: string,
  atletaId: string,
  filtros: { pagina?: number; limite?: number },
): Promise<ListarRutinasPendientesResultado> => {
  await validarEntrenador(entrenadorId)

  const perfil = await dbObtenerEntrenado(entrenadorId, atletaId)
  if (!perfil) throw createHttpError(404, 'El atleta no está vinculado')

  return dbListarRutinasPendientes(entrenadorId, atletaId, filtros)
}

export const actualizarPerfilAtleta = async (
  entrenadorId: string,
  atletaId: string,
  data: GuardarPerfilAtletaInput,
): Promise<void> => {
  await validarEntrenador(entrenadorId)

  if (data.objetivoPrincipal && !OBJETIVOS_PRINCIPALES.some((o) => o.valor === data.objetivoPrincipal)) {
    throw createHttpError(400, 'Objetivo principal inválido')
  }
  if (data.diasPorSemana !== undefined && (data.diasPorSemana < 1 || data.diasPorSemana > 7)) {
    throw createHttpError(400, 'Los días por semana deben estar entre 1 y 7')
  }

  const vinculada = await existeVinculacionActiva(entrenadorId, atletaId)
  if (!vinculada) throw createHttpError(403, 'El atleta no está vinculado activamente')

  await dbGuardarPerfilAtleta(atletaId, data)
}

const MAX_NOTAS_LONGITUD = 2000

export const actualizarNotasEntrenador = async (
  entrenadorId: string,
  atletaId: string,
  data: GuardarNotasInput,
): Promise<void> => {
  await validarEntrenador(entrenadorId)

  const notas = data.notas?.trim() ?? ''
  if (notas.length > MAX_NOTAS_LONGITUD) {
    throw createHttpError(400, `Las notas no pueden superar los ${MAX_NOTAS_LONGITUD} caracteres`)
  }

  const vinculada = await existeVinculacionActiva(entrenadorId, atletaId)
  if (!vinculada) throw createHttpError(403, 'El atleta no está vinculado activamente')

  await dbGuardarNotasEntrenador(entrenadorId, atletaId, notas || null)
}
