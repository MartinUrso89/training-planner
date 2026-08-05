import { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import type { PlantillaPlan, SeccionPlantilla, EjercicioPlantilla } from '../../domain/types/plantillaPlan.types.js'
import type { CrearPlantillaInput, CrearSeccionInput, CrearEjercicioEnSeccionInput } from '../../domain/types/plantillaPlan.types.js'

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

const ejercicioPlantillaSelect = {
  id: true,
  seccionPlantillaId: true,
  ejercicioId: true,
  orden: true,
  series: true,
  repeticiones: true,
  duracionSegundos: true,
  peso: true,
  rpe: true,
  descansoEntreSeries: true,
  grupoSuperserieId: true,
  ordenSuperserie: true,
  notas: true,
  ejercicio: { select: ejercicioSelect },
} as const

const seccionPlantillaSelect = {
  id: true,
  plantillaId: true,
  tipoSeccionId: true,
  nombre: true,
  orden: true,
  rondas: true,
  tiempoLimite: true,
  descansoEntreEjercicios: true,
  descansoEntreRondas: true,
  descansoEntreSecciones: true,
  ejercicios: { select: ejercicioPlantillaSelect, orderBy: { orden: 'asc' as const } },
} as const

const plantillaSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  usuarioId: true,
  creadoEn: true,
  actualizadoEn: true,
  secciones: { select: seccionPlantillaSelect, orderBy: { orden: 'asc' as const } },
} as const

type PlantillaPayload = Prisma.PlantillaPlanGetPayload<{ select: typeof plantillaSelect }>
type SeccionPayload = Prisma.SeccionPlantillaGetPayload<{ select: typeof seccionPlantillaSelect }>
type EjercicioPayload = Prisma.EjercicioPlantillaGetPayload<{ select: typeof ejercicioPlantillaSelect }>

const mapearEjercicio = (e: EjercicioPayload): EjercicioPlantilla => ({
  id: e.id,
  seccionPlantillaId: e.seccionPlantillaId,
  ejercicioId: e.ejercicioId,
  orden: e.orden,
  series: e.series,
  repeticiones: e.repeticiones,
  duracionSegundos: e.duracionSegundos,
  peso: e.peso,
  rpe: e.rpe,
  descansoEntreSeries: e.descansoEntreSeries,
  grupoSuperserieId: e.grupoSuperserieId,
  ordenSuperserie: e.ordenSuperserie,
  notas: e.notas,
  ejercicio: e.ejercicio,
})

const mapearSeccion = (s: SeccionPayload): SeccionPlantilla => ({
  id: s.id,
  plantillaId: s.plantillaId,
  tipoSeccionId: s.tipoSeccionId,
  nombre: s.nombre,
  orden: s.orden,
  rondas: s.rondas,
  tiempoLimite: s.tiempoLimite,
  descansoEntreEjercicios: s.descansoEntreEjercicios,
  descansoEntreRondas: s.descansoEntreRondas,
  descansoEntreSecciones: s.descansoEntreSecciones,
  ejercicios: s.ejercicios.map(mapearEjercicio),
})

const mapearPlantilla = (p: PlantillaPayload): PlantillaPlan => ({
  id: p.id,
  nombre: p.nombre,
  descripcion: p.descripcion,
  usuarioId: p.usuarioId,
  creadoEn: p.creadoEn,
  actualizadoEn: p.actualizadoEn,
  secciones: p.secciones.map(mapearSeccion),
})

export const listarPlantillas = (usuarioId: string): Promise<PlantillaPlan[]> =>
  prisma.plantillaPlan.findMany({
    where: { usuarioId },
    select: plantillaSelect,
    orderBy: { creadoEn: 'desc' },
  }).then((ps) => ps.map(mapearPlantilla))

export const buscarPlantillaPorId = (id: string): Promise<PlantillaPlan | null> =>
  prisma.plantillaPlan.findUnique({ where: { id }, select: plantillaSelect })
    .then((p) => p ? mapearPlantilla(p) : null)

export const crearPlantilla = (usuarioId: string, data: CrearPlantillaInput): Promise<PlantillaPlan> =>
  prisma.plantillaPlan.create({
    data: { nombre: data.nombre, descripcion: data.descripcion ?? null, usuarioId },
    select: plantillaSelect,
  }).then(mapearPlantilla)

export const eliminarPlantilla = (id: string): Promise<void> =>
  prisma.plantillaPlan.delete({ where: { id } }).then(() => undefined)

export const agregarSeccion = (plantillaId: string, data: CrearSeccionInput): Promise<SeccionPlantilla> =>
  prisma.seccionPlantilla.create({
    data: {
      plantillaId,
      tipoSeccionId: data.tipoSeccionId,
      nombre: data.nombre ?? null,
      orden: data.orden,
      rondas: data.rondas ?? null,
      tiempoLimite: data.tiempoLimite ?? null,
      descansoEntreEjercicios: data.descansoEntreEjercicios ?? null,
      descansoEntreRondas: data.descansoEntreRondas ?? null,
      descansoEntreSecciones: data.descansoEntreSecciones ?? null,
    },
    select: seccionPlantillaSelect,
  }).then(mapearSeccion)

export const eliminarSeccion = (id: string): Promise<void> =>
  prisma.seccionPlantilla.delete({ where: { id } }).then(() => undefined)

export const agregarEjercicioASeccion = (seccionId: string, data: CrearEjercicioEnSeccionInput): Promise<EjercicioPlantilla> =>
  prisma.ejercicioPlantilla.create({
    data: {
      seccionPlantillaId: seccionId,
      ejercicioId: data.ejercicioId,
      orden: data.orden,
      series: data.series ?? null,
      repeticiones: data.repeticiones ?? null,
      duracionSegundos: data.duracionSegundos ?? null,
      peso: data.peso ?? null,
      rpe: data.rpe ?? null,
      descansoEntreSeries: data.descansoEntreSeries ?? null,
      grupoSuperserieId: data.grupoSuperserieId ?? null,
      ordenSuperserie: data.ordenSuperserie ?? null,
      notas: data.notas ?? null,
    },
    select: ejercicioPlantillaSelect,
  }).then(mapearEjercicio)

export const eliminarEjercicioDeSeccion = (id: string): Promise<void> =>
  prisma.ejercicioPlantilla.delete({ where: { id } }).then(() => undefined)

export const actualizarEjercicioEnSeccion = (id: string, data: Partial<CrearEjercicioEnSeccionInput>): Promise<EjercicioPlantilla> =>
  prisma.ejercicioPlantilla.update({
    where: { id },
    data: {
      ...(data.ejercicioId !== undefined && { ejercicioId: data.ejercicioId }),
      ...(data.orden !== undefined && { orden: data.orden }),
      ...(data.series !== undefined && { series: data.series }),
      ...(data.repeticiones !== undefined && { repeticiones: data.repeticiones }),
      ...(data.duracionSegundos !== undefined && { duracionSegundos: data.duracionSegundos }),
      ...(data.peso !== undefined && { peso: data.peso }),
      ...(data.rpe !== undefined && { rpe: data.rpe }),
      ...(data.descansoEntreSeries !== undefined && { descansoEntreSeries: data.descansoEntreSeries }),
      ...(data.grupoSuperserieId !== undefined && { grupoSuperserieId: data.grupoSuperserieId }),
      ...(data.ordenSuperserie !== undefined && { ordenSuperserie: data.ordenSuperserie }),
      ...(data.notas !== undefined && { notas: data.notas }),
    },
    select: ejercicioPlantillaSelect,
  }).then(mapearEjercicio)
