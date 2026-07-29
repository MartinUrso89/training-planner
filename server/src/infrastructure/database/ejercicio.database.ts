import prisma from '../../lib/prisma.js'
import type { Ejercicio, CrearEjercicioInput, ActualizarEjercicioInput, SugerenciaEjercicio, CrearSugerenciaEjercicioInput } from '../../domain/types/ejercicio.types.js'

export interface FiltrosEjercicio {
  buscar?: string
  musculoPrincipal?: string
  tipoArticular?: string
  patronMovimiento?: string
}

const camposEjercicio = {
  id: true,
  nombre: true,
  musculoPrincipal: true,
  musculoSecundario: true,
  tipoArticular: true,
  patronMovimiento: true,
  videoUrl: true,
  descripcion: true,
  creadoPor: true,
  creadoEn: true,
} as const

const camposSugerencia = {
  id: true,
  nombre: true,
  musculoPrincipal: true,
  musculoSecundario: true,
  tipoArticular: true,
  patronMovimiento: true,
  videoUrl: true,
  descripcion: true,
  sugeridoPor: true,
  sugeridoEn: true,
  estado: true,
  revisadoPor: true,
  revisadoEn: true,
  comentarioRechazo: true,
} as const

export const listarEjercicios = (filtros?: FiltrosEjercicio): Promise<Ejercicio[]> => {
  const where: Record<string, unknown> = {}

  if (filtros?.buscar) where.nombre = { contains: filtros.buscar }
  if (filtros?.musculoPrincipal) where.musculoPrincipal = filtros.musculoPrincipal
  if (filtros?.tipoArticular) where.tipoArticular = filtros.tipoArticular
  if (filtros?.patronMovimiento) where.patronMovimiento = filtros.patronMovimiento

  return prisma.ejercicio.findMany({
    where,
    select: camposEjercicio,
    orderBy: { nombre: 'asc' },
  })
}

export const buscarEjercicioPorId = (id: string): Promise<Ejercicio | null> =>
  prisma.ejercicio.findUnique({ where: { id }, select: camposEjercicio })

export const crearEjercicio = (usuarioId: string, data: CrearEjercicioInput): Promise<Ejercicio> =>
  prisma.ejercicio.create({
    data: {
      nombre: data.nombre,
      musculoPrincipal: data.musculoPrincipal,
      musculoSecundario: data.musculoSecundario ?? null,
      tipoArticular: data.tipoArticular,
      patronMovimiento: data.patronMovimiento,
      videoUrl: data.videoUrl ?? null,
      descripcion: data.descripcion ?? null,
      creadoPor: usuarioId,
    },
    select: camposEjercicio,
  })

export const actualizarEjercicio = (id: string, data: ActualizarEjercicioInput): Promise<Ejercicio> =>
  prisma.ejercicio.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.musculoPrincipal !== undefined && { musculoPrincipal: data.musculoPrincipal }),
      ...(data.musculoSecundario !== undefined && { musculoSecundario: data.musculoSecundario }),
      ...(data.tipoArticular !== undefined && { tipoArticular: data.tipoArticular }),
      ...(data.patronMovimiento !== undefined && { patronMovimiento: data.patronMovimiento }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
    },
    select: camposEjercicio,
  })

export const eliminarEjercicio = (id: string): Promise<void> =>
  prisma.ejercicio.delete({ where: { id } }).then(() => undefined)

export const listarGruposMusculares = (): Promise<{ musculoPrincipal: string }[]> =>
  prisma.ejercicio.findMany({
    select: { musculoPrincipal: true },
    distinct: ['musculoPrincipal'],
    orderBy: { musculoPrincipal: 'asc' },
  })

export const crearSugerenciaEjercicio = (usuarioId: string, data: CrearSugerenciaEjercicioInput): Promise<SugerenciaEjercicio> =>
  prisma.sugerenciaEjercicio.create({
    data: {
      nombre: data.nombre,
      musculoPrincipal: data.musculoPrincipal,
      musculoSecundario: data.musculoSecundario ?? null,
      tipoArticular: data.tipoArticular,
      patronMovimiento: data.patronMovimiento,
      videoUrl: data.videoUrl ?? null,
      descripcion: data.descripcion ?? null,
      sugeridoPor: usuarioId,
    },
    select: camposSugerencia,
  })

export const listarSugerenciasEjercicio = (): Promise<SugerenciaEjercicio[]> =>
  prisma.sugerenciaEjercicio.findMany({
    select: camposSugerencia,
    orderBy: { sugeridoEn: 'desc' },
  })
