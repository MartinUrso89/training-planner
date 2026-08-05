import prisma from '../../lib/prisma.js'
import type { Entrenado, FiltrosEntrenados, ListarEntrenadosResultado, GuardarPerfilAtletaInput } from '../../domain/types/perfilAtleta.types.js'

interface VinculacionBasica {
  id: string
  estado: 'Pendiente' | 'Activo' | 'Inactivo'
  atleta: { id: string; nombre: string; correo: string }
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

  const pendientesMap = new Map(pendientes.map((p) => [p.usuarioId, p._count]))
  const ultimosMap = new Map(ultimos.map((u) => [u.usuarioId, u._max.completadoEn]))
  const perfilesMap = new Map(perfiles.map((p) => [p.atletaId, p]))

  const filas: Entrenado[] = vinculaciones.map((v) => {
    const perfil = perfilesMap.get(v.atleta.id)
    return {
      vinculacionId: v.id,
      atleta: v.atleta,
      estado: v.estado,
      objetivoPrincipal: perfil?.objetivoPrincipal ?? null,
      diasPorSemana: perfil?.diasPorSemana ?? null,
      descripcion: perfil?.descripcion ?? null,
      ultimoEntrenamiento: ultimosMap.get(v.atleta.id) ?? null,
      rutinasPendientes: pendientesMap.get(v.atleta.id) ?? 0,
    }
  })

  const filtradas = filtros.tienePendientes ? filas.filter((f) => f.rutinasPendientes > 0) : filas
  const total = filtradas.length
  const inicio = (pagina - 1) * limite

  return { datos: filtradas.slice(inicio, inicio + limite), total, pagina, limite }
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
