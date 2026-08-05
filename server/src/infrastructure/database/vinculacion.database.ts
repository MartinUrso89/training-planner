import prisma from '../../lib/prisma.js'
import type { Vinculacion as VinculacionPrisma } from '@prisma/client'
import type { EstadoVinculacion, Vinculacion } from '../../domain/types/vinculacion.types.js'

const includePartes = {
  entrenador: { select: { id: true, nombre: true, correo: true } },
  atleta: { select: { id: true, nombre: true, correo: true } },
} as const

type VinculacionPayload = VinculacionPrisma & {
  entrenador: { id: string; nombre: string; correo: string }
  atleta: { id: string; nombre: string; correo: string }
}

const mapear = (v: VinculacionPayload): Vinculacion => ({
  id: v.id,
  entrenadorId: v.entrenadorId,
  atletaId: v.atletaId,
  estado: v.estado,
  creadoEn: v.creadoEn,
  aceptadoEn: v.aceptadoEn,
  actualizadoEn: v.actualizadoEn,
  entrenador: v.entrenador,
  atleta: v.atleta,
})

export const crearVinculacion = (entrenadorId: string, atletaId: string): Promise<Vinculacion> =>
  prisma.vinculacion
    .create({ data: { entrenadorId, atletaId }, include: includePartes })
    .then(mapear)

export const buscarVinculacionPorPar = (entrenadorId: string, atletaId: string): Promise<Vinculacion | null> =>
  prisma.vinculacion
    .findUnique({ where: { entrenadorId_atletaId: { entrenadorId, atletaId } }, include: includePartes })
    .then((v) => (v ? mapear(v) : null))

export const buscarVinculacionPorId = (id: string): Promise<Vinculacion | null> =>
  prisma.vinculacion.findUnique({ where: { id }, include: includePartes }).then((v) => (v ? mapear(v) : null))

export const existeVinculacionActiva = async (entrenadorId: string, atletaId: string): Promise<boolean> => {
  const v = await prisma.vinculacion.findUnique({
    where: { entrenadorId_atletaId: { entrenadorId, atletaId } },
    select: { estado: true },
  })
  return v?.estado === 'Activo'
}

export const listarVinculacionesPorEntrenador = (entrenadorId: string, estado?: EstadoVinculacion): Promise<Vinculacion[]> =>
  prisma.vinculacion
    .findMany({ where: { entrenadorId, ...(estado ? { estado } : {}) }, include: includePartes, orderBy: { creadoEn: 'desc' } })
    .then((list) => list.map(mapear))

export const listarVinculacionesPorAtleta = (atletaId: string, estado?: EstadoVinculacion): Promise<Vinculacion[]> =>
  prisma.vinculacion
    .findMany({ where: { atletaId, ...(estado ? { estado } : {}) }, include: includePartes, orderBy: { creadoEn: 'desc' } })
    .then((list) => list.map(mapear))

export const actualizarEstadoVinculacion = (
  id: string,
  estado: EstadoVinculacion,
  aceptadoEn?: Date,
): Promise<Vinculacion> =>
  prisma.vinculacion
    .update({
      where: { id },
      data: { estado, ...(aceptadoEn ? { aceptadoEn } : {}) },
      include: includePartes,
    })
    .then(mapear)

export const eliminarVinculacion = (id: string): Promise<void> =>
  prisma.vinculacion.delete({ where: { id } }).then(() => undefined)
