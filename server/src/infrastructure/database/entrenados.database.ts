import prisma from '../../lib/prisma.js'
import type { Entrenado, PerfilEntrenado, FiltrosEntrenados, ListarEntrenadosResultado, GuardarPerfilAtletaInput } from '../../domain/types/perfilAtleta.types.js'
import type { ListarEntrenamientosRealizadosResultado, ListarRutinasPendientesResultado } from '../../domain/types/entrenamiento.types.js'

interface VinculacionBasica {
  id: string
  estado: 'Pendiente' | 'Activo' | 'Inactivo'
  atleta: { id: string; nombre: string; correo: string }
}

const obtenerAgregados = async (entrenadorId: string, atletaIds: string[]) => {
  const [pendientes, ultimos, perfiles] = await Promise.all([
    atletaIds.length
      ? prisma.entrenamiento.groupBy({
          by: ['usuarioId'],
          where: { usuarioId: { in: atletaIds }, asignadoPorId: entrenadorId, completado: false },
          _count: true,
        })
      : Promise.resolve([]),
    atletaIds.length
      ? prisma.entrenamiento.groupBy({
          by: ['usuarioId'],
          where: { usuarioId: { in: atletaIds }, completado: true },
          _max: { completadoEn: true },
        })
      : Promise.resolve([]),
    atletaIds.length
      ? prisma.perfilAtleta.findMany({ where: { atletaId: { in: atletaIds } } })
      : Promise.resolve([]),
  ])

  return {
    pendientesMap: new Map(pendientes.map((p) => [p.usuarioId, p._count])),
    ultimosMap: new Map(ultimos.map((u) => [u.usuarioId, u._max.completadoEn])),
    perfilesMap: new Map(perfiles.map((p) => [p.atletaId, p])),
  }
}

const componerEntrenado = (
  v: VinculacionBasica,
  pendientesMap: Map<string, number>,
  ultimosMap: Map<string, Date | null>,
  perfilesMap: Map<string, { objetivoPrincipal: string | null; diasPorSemana: number | null; descripcion: string | null }>,
): Entrenado => {
  const perfil = perfilesMap.get(v.atleta.id)
  return {
    vinculacionId: v.id,
    atleta: v.atleta,
    estado: v.estado,
    objetivoPrincipal: (perfil?.objetivoPrincipal ?? null) as Entrenado['objetivoPrincipal'],
    diasPorSemana: perfil?.diasPorSemana ?? null,
    descripcion: perfil?.descripcion ?? null,
    ultimoEntrenamiento: ultimosMap.get(v.atleta.id) ?? null,
    rutinasPendientes: pendientesMap.get(v.atleta.id) ?? 0,
  }
}

export const listarEntrenados = async (
  entrenadorId: string,
  filtros: FiltrosEntrenados,
): Promise<ListarEntrenadosResultado> => {
  const pagina = Math.max(1, filtros.pagina ?? 1)
  const limite = Math.min(50, Math.max(1, filtros.limite ?? 8))

  const vinculaciones = (await prisma.vinculacion.findMany({
    where: {
      entrenadorId,
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.busqueda?.trim()
        ? { atleta: { nombre: { contains: filtros.busqueda.trim() } } }
        : {}),
    },
    select: {
      id: true,
      estado: true,
      atleta: { select: { id: true, nombre: true, correo: true } },
    },
  })) as unknown as VinculacionBasica[]

  const atletaIds = vinculaciones.map((v) => v.atleta.id)
  const { pendientesMap, ultimosMap, perfilesMap } = await obtenerAgregados(entrenadorId, atletaIds)

  const filas: Entrenado[] = vinculaciones.map((v) => componerEntrenado(v, pendientesMap, ultimosMap, perfilesMap))

  const filtradas = filtros.tienePendientes ? filas.filter((f) => f.rutinasPendientes > 0) : filas
  const total = filtradas.length
  const inicio = (pagina - 1) * limite

  return { datos: filtradas.slice(inicio, inicio + limite), total, pagina, limite }
}

export const obtenerEntrenado = async (entrenadorId: string, atletaId: string): Promise<PerfilEntrenado | null> => {
  const vinculacion = (await prisma.vinculacion.findUnique({
    where: { entrenadorId_atletaId: { entrenadorId, atletaId } },
    select: {
      id: true,
      estado: true,
      aceptadoEn: true,
      atleta: { select: { id: true, nombre: true, correo: true } },
    },
  })) as unknown as (VinculacionBasica & { aceptadoEn: Date | null }) | null

  if (!vinculacion) return null

  const { pendientesMap, ultimosMap, perfilesMap } = await obtenerAgregados(entrenadorId, [atletaId])
  const base = componerEntrenado(vinculacion, pendientesMap, ultimosMap, perfilesMap)

  return { ...base, vinculadoDesde: vinculacion.aceptadoEn }
}

export const listarEntrenamientosRealizados = async (
  entrenadorId: string,
  atletaId: string,
  filtros: { pagina?: number; limite?: number },
): Promise<ListarEntrenamientosRealizadosResultado> => {
  const pagina = Math.max(1, filtros.pagina ?? 1)
  const limite = Math.min(50, Math.max(1, filtros.limite ?? 15))

  const where = { usuarioId: atletaId, asignadoPorId: entrenadorId, completado: true }
  const [total, entrenamientos] = await Promise.all([
    prisma.entrenamiento.count({ where }),
    prisma.entrenamiento.findMany({
      where,
      select: {
        id: true,
        nombreRutina: true,
        plantilla: { select: { nombre: true } },
        fecha: true,
        completadoEn: true,
        comentario: true,
      },
      orderBy: { completadoEn: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ])

  const datos = entrenamientos.map((e) => ({
    id: e.id,
    nombreRutina: e.nombreRutina ?? e.plantilla?.nombre ?? null,
    fecha: e.fecha,
    completadoEn: e.completadoEn!,
    comentario: e.comentario,
  }))

  return { datos, total, pagina, limite }
}

export const listarRutinasPendientes = async (
  entrenadorId: string,
  atletaId: string,
  filtros: { pagina?: number; limite?: number },
): Promise<ListarRutinasPendientesResultado> => {
  const pagina = Math.max(1, filtros.pagina ?? 1)
  const limite = Math.min(50, Math.max(1, filtros.limite ?? 15))

  const where = { usuarioId: atletaId, asignadoPorId: entrenadorId, completado: false }
  const [total, entrenamientos] = await Promise.all([
    prisma.entrenamiento.count({ where }),
    prisma.entrenamiento.findMany({
      where,
      select: {
        id: true,
        nombreRutina: true,
        plantilla: { select: { nombre: true } },
        fecha: true,
      },
      orderBy: { fecha: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ])

  const datos = entrenamientos.map((e) => ({
    id: e.id,
    nombreRutina: e.nombreRutina ?? e.plantilla?.nombre ?? null,
    fecha: e.fecha,
  }))

  return { datos, total, pagina, limite }
}

export const guardarPerfilAtleta = (atletaId: string, data: GuardarPerfilAtletaInput): Promise<void> =>
  prisma.perfilAtleta
    .upsert({
      where: { atletaId },
      update: {
        ...(data.objetivoPrincipal !== undefined ? { objetivoPrincipal: data.objetivoPrincipal } : {}),
        ...(data.diasPorSemana !== undefined ? { diasPorSemana: data.diasPorSemana } : {}),
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
      },
      create: {
        atletaId,
        ...(data.objetivoPrincipal !== undefined ? { objetivoPrincipal: data.objetivoPrincipal } : {}),
        ...(data.diasPorSemana !== undefined ? { diasPorSemana: data.diasPorSemana } : {}),
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
      },
    })
    .then(() => undefined)
