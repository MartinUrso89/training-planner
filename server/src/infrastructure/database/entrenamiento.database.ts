import { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import type { Entrenamiento, SeccionEntrenamiento, EjercicioEntrenamiento, RegistroEjercicio } from '../../domain/types/entrenamiento.types.js'

const logSelect = {
  id: true,
  ejercicioEntrenamientoId: true,
  completado: true,
  repeticionesReales: true,
  pesoReal: true,
  rpeReal: true,
  duracionReal: true,
  comentario: true,
  completadoEn: true,
} as const

const ejercicioSelect = {
  id: true,
  nombre: true,
  musculoPrincipal: true,
  musculoSecundario: true,
  tipoArticular: true,
  patronMovimiento: true,
  imagenUrl: true,
  videoUrl: true,
  descripcion: true,
  creadoPor: true,
  creadoEn: true,
} as const

const ejercicioEntrenamientoSelect = {
  id: true,
  seccionEntrenamientoId: true,
  ejercicioId: true,
  orden: true,
  seriesPrevistas: true,
  repeticionesPrevistas: true,
  duracionPrevista: true,
  pesoPrevisto: true,
  rpePrevisto: true,
  descansoPrevisto: true,
  grupoSuperserieId: true,
  ordenSuperserie: true,
  notas: true,
  ejercicio: { select: ejercicioSelect },
  registros: { select: logSelect },
} as const

const seccionEntrenamientoSelect = {
  id: true,
  entrenamientoId: true,
  tipoSeccionId: true,
  nombre: true,
  orden: true,
  rondas: true,
  tiempoLimite: true,
  descansoEntreEjercicios: true,
  descansoEntreRondas: true,
  descansoEntreSecciones: true,
  rondasCompletadas: true,
  tiempoTotalReal: true,
  ejercicios: { select: ejercicioEntrenamientoSelect, orderBy: { orden: 'asc' as const } },
} as const

const entrenamientoSelect = {
  id: true,
  plantillaId: true,
  usuarioId: true,
  asignadoPorId: true,
  fecha: true,
  completado: true,
  completadoEn: true,
  creadoEn: true,
  secciones: { select: seccionEntrenamientoSelect, orderBy: { orden: 'asc' as const } },
} as const

type EntrenamientoPayload = Prisma.EntrenamientoGetPayload<{ select: typeof entrenamientoSelect }>
type SeccionPayload = Prisma.SeccionEntrenamientoGetPayload<{ select: typeof seccionEntrenamientoSelect }>
type EjercicioPayload = Prisma.EjercicioEntrenamientoGetPayload<{ select: typeof ejercicioEntrenamientoSelect }>
type LogPayload = Prisma.RegistroEjercicioGetPayload<{ select: typeof logSelect }>

const mapearLog = (l: LogPayload): RegistroEjercicio => ({
  id: l.id,
  ejercicioEntrenamientoId: l.ejercicioEntrenamientoId,
  completado: l.completado,
  repeticionesReales: l.repeticionesReales,
  pesoReal: l.pesoReal !== null ? Number(l.pesoReal) : null,
  rpeReal: l.rpeReal !== null ? Number(l.rpeReal) : null,
  duracionReal: l.duracionReal,
  comentario: l.comentario,
  completadoEn: l.completadoEn,
})

const mapearEjercicio = (e: EjercicioPayload): EjercicioEntrenamiento => ({
  id: e.id,
  seccionEntrenamientoId: e.seccionEntrenamientoId,
  ejercicioId: e.ejercicioId,
  orden: e.orden,
  seriesPrevistas: e.seriesPrevistas,
  repeticionesPrevistas: e.repeticionesPrevistas,
  duracionPrevista: e.duracionPrevista,
  pesoPrevisto: e.pesoPrevisto !== null ? Number(e.pesoPrevisto) : null,
  rpePrevisto: e.rpePrevisto !== null ? Number(e.rpePrevisto) : null,
  descansoPrevisto: e.descansoPrevisto,
  grupoSuperserieId: e.grupoSuperserieId,
  ordenSuperserie: e.ordenSuperserie,
  notas: e.notas,
  ejercicio: e.ejercicio,
  registros: e.registros.map(mapearLog),
})

const mapearSeccion = (s: SeccionPayload): SeccionEntrenamiento => ({
  id: s.id,
  entrenamientoId: s.entrenamientoId,
  tipoSeccionId: s.tipoSeccionId,
  nombre: s.nombre,
  orden: s.orden,
  rondas: s.rondas,
  tiempoLimite: s.tiempoLimite,
  descansoEntreEjercicios: s.descansoEntreEjercicios,
  descansoEntreRondas: s.descansoEntreRondas,
  descansoEntreSecciones: s.descansoEntreSecciones,
  rondasCompletadas: s.rondasCompletadas,
  tiempoTotalReal: s.tiempoTotalReal,
  ejercicios: s.ejercicios.map(mapearEjercicio),
})

const mapearEntrenamiento = (w: EntrenamientoPayload): Entrenamiento => ({
  id: w.id,
  plantillaId: w.plantillaId,
  usuarioId: w.usuarioId,
  asignadoPorId: w.asignadoPorId,
  fecha: w.fecha,
  completado: w.completado,
  completadoEn: w.completadoEn,
  creadoEn: w.creadoEn,
  secciones: w.secciones.map(mapearSeccion),
})

export const listarEntrenamientosPorUsuario = (usuarioId: string): Promise<Entrenamiento[]> =>
  prisma.entrenamiento.findMany({
    where: { usuarioId },
    select: entrenamientoSelect,
    orderBy: { fecha: 'desc' },
  }).then((ws) => ws.map(mapearEntrenamiento))

export const buscarEntrenamientoPorId = (id: string): Promise<Entrenamiento | null> =>
  prisma.entrenamiento.findUnique({ where: { id }, select: entrenamientoSelect })
    .then((w) => w ? mapearEntrenamiento(w) : null)

export const asignarEntrenamiento = async (
  plantillaId: string,
  usuarioId: string,
  asignadoPorId: string,
  fecha: Date,
): Promise<Entrenamiento> => {
  const plantilla = await prisma.plantillaPlan.findUnique({
    where: { id: plantillaId },
    include: {
      secciones: {
        include: { ejercicios: true },
        orderBy: { orden: 'asc' },
      },
    },
  })

  if (!plantilla) throw new Error('Plantilla no encontrada')

  const entrenamiento = await prisma.entrenamiento.create({
    data: {
      plantillaId,
      usuarioId,
      asignadoPorId,
      fecha,
      secciones: {
        create: plantilla.secciones.map((s) => ({
          tipoSeccionId: s.tipoSeccionId,
          nombre: s.nombre,
          orden: s.orden,
          rondas: s.rondas,
          tiempoLimite: s.tiempoLimite,
          descansoEntreEjercicios: s.descansoEntreEjercicios,
          descansoEntreRondas: s.descansoEntreRondas,
          descansoEntreSecciones: s.descansoEntreSecciones,
          ejercicios: {
            create: s.ejercicios.map((e) => ({
              ejercicioId: e.ejercicioId,
              orden: e.orden,
              seriesPrevistas: e.series,
              repeticionesPrevistas: e.repeticiones,
              duracionPrevista: e.duracionSegundos,
              pesoPrevisto: e.peso,
              rpePrevisto: e.rpe,
              descansoPrevisto: e.descansoEntreSeries,
              grupoSuperserieId: e.grupoSuperserieId,
              ordenSuperserie: e.ordenSuperserie,
              notas: e.notas,
            })),
          },
        })),
      },
    },
    select: entrenamientoSelect,
  })

  return mapearEntrenamiento(entrenamiento)
}

export const completarEntrenamiento = (id: string): Promise<Entrenamiento> =>
  prisma.entrenamiento.update({
    where: { id },
    data: { completado: true, completadoEn: new Date() },
    select: entrenamientoSelect,
  }).then(mapearEntrenamiento)

export const crearRegistroEjercicio = (
  ejercicioEntrenamientoId: string,
  data: {
    completado?: boolean
    repeticionesReales?: number
    pesoReal?: number
    rpeReal?: number
    duracionReal?: number
    comentario?: string
  },
): Promise<RegistroEjercicio> =>
  prisma.registroEjercicio.create({
    data: {
      ejercicioEntrenamientoId,
      completado: data.completado ?? false,
      repeticionesReales: data.repeticionesReales ?? null,
      pesoReal: data.pesoReal ?? null,
      rpeReal: data.rpeReal ?? null,
      duracionReal: data.duracionReal ?? null,
      comentario: data.comentario ?? null,
      completadoEn: data.completado ? new Date() : null,
    },
    select: logSelect,
  }).then(mapearLog)

export const actualizarRegistroEjercicio = (
  id: string,
  data: {
    completado?: boolean
    repeticionesReales?: number
    pesoReal?: number
    rpeReal?: number
    duracionReal?: number
    comentario?: string
  },
): Promise<RegistroEjercicio> =>
  prisma.registroEjercicio.update({
    where: { id },
    data: {
      ...(data.completado !== undefined && { completado: data.completado, completadoEn: data.completado ? new Date() : null }),
      ...(data.repeticionesReales !== undefined && { repeticionesReales: data.repeticionesReales }),
      ...(data.pesoReal !== undefined && { pesoReal: data.pesoReal }),
      ...(data.rpeReal !== undefined && { rpeReal: data.rpeReal }),
      ...(data.duracionReal !== undefined && { duracionReal: data.duracionReal }),
      ...(data.comentario !== undefined && { comentario: data.comentario }),
    },
    select: logSelect,
  }).then(mapearLog)
