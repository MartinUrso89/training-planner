import { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import type { DomainPlanTemplate, DomainTemplateSection, DomainTemplateExercise } from '../../domain/types/planTemplate.types.js'
import type { CreatePlanTemplateInput, CreateTemplateSectionInput, CreateTemplateExerciseInput } from '../../domain/types/planTemplate.types.js'

const exerciseSelect = {
  id: true,
  name: true,
  muscleGroup: true,
  videoUrl: true,
  description: true,
  createdBy: true,
  createdAt: true,
} as const

const templateExerciseSelect = {
  id: true,
  templateSectionId: true,
  exerciseId: true,
  sortOrder: true,
  sets: true,
  reps: true,
  durationSeconds: true,
  weight: true,
  rpe: true,
  restBetweenSets: true,
  supersetGroupId: true,
  supersetOrder: true,
  notes: true,
  exercise: { select: exerciseSelect },
} as const

const templateSectionSelect = {
  id: true,
  templateId: true,
  sectionTypeId: true,
  name: true,
  sortOrder: true,
  rounds: true,
  timeCap: true,
  restBetweenExercises: true,
  restBetweenRounds: true,
  exercises: { select: templateExerciseSelect, orderBy: { sortOrder: 'asc' as const } },
} as const

const templateSelect = {
  id: true,
  name: true,
  description: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  sections: { select: templateSectionSelect, orderBy: { sortOrder: 'asc' as const } },
} as const

type TemplatePayload = Prisma.PlanTemplateGetPayload<{ select: typeof templateSelect }>
type SectionPayload = Prisma.PlanTemplateSectionGetPayload<{ select: typeof templateSectionSelect }>
type ExercisePayload = Prisma.PlanTemplateExerciseGetPayload<{ select: typeof templateExerciseSelect }>

const toDomainExerciseInSection = (e: ExercisePayload): DomainTemplateExercise => ({
  id: e.id,
  templateSectionId: e.templateSectionId,
  exerciseId: e.exerciseId,
  sortOrder: e.sortOrder,
  sets: e.sets,
  reps: e.reps,
  durationSeconds: e.durationSeconds,
  weight: e.weight !== null ? Number(e.weight) : null,
  rpe: e.rpe !== null ? Number(e.rpe) : null,
  restBetweenSets: e.restBetweenSets,
  supersetGroupId: e.supersetGroupId,
  supersetOrder: e.supersetOrder,
  notes: e.notes,
  exercise: e.exercise,
})

const toDomainSection = (s: SectionPayload): DomainTemplateSection => ({
  id: s.id,
  templateId: s.templateId,
  sectionTypeId: s.sectionTypeId,
  name: s.name,
  sortOrder: s.sortOrder,
  rounds: s.rounds,
  timeCap: s.timeCap,
  restBetweenExercises: s.restBetweenExercises,
  restBetweenRounds: s.restBetweenRounds,
  exercises: s.exercises.map(toDomainExerciseInSection),
})

const toDomainTemplate = (t: TemplatePayload): DomainPlanTemplate => ({
  id: t.id,
  name: t.name,
  description: t.description,
  userId: t.userId,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  sections: t.sections.map(toDomainSection),
})

export const listTemplates = (userId: string): Promise<DomainPlanTemplate[]> =>
  prisma.planTemplate
    .findMany({
      where: { userId },
      select: templateSelect,
      orderBy: { updatedAt: 'desc' },
    })
    .then((raw) => raw.map(toDomainTemplate))

export const findTemplateById = (id: string): Promise<DomainPlanTemplate | null> =>
  prisma.planTemplate
    .findUnique({ where: { id }, select: templateSelect })
    .then((raw) => (raw ? toDomainTemplate(raw) : null))

export const createTemplate = (userId: string, data: CreatePlanTemplateInput): Promise<DomainPlanTemplate> =>
  prisma.planTemplate
    .create({
      data: { name: data.name, description: data.description ?? null, userId },
      select: templateSelect,
    })
    .then(toDomainTemplate)

export const deleteTemplate = (id: string): Promise<void> =>
  prisma.planTemplate.delete({ where: { id } }).then(() => undefined)

export const addSection = (templateId: string, data: CreateTemplateSectionInput): Promise<DomainTemplateSection> =>
  prisma.planTemplateSection
    .create({
      data: {
        templateId,
        sectionTypeId: data.sectionTypeId,
        name: data.name ?? null,
        sortOrder: data.sortOrder,
        rounds: data.rounds ?? null,
        timeCap: data.timeCap ?? null,
        restBetweenExercises: data.restBetweenExercises ?? null,
        restBetweenRounds: data.restBetweenRounds ?? null,
      },
      select: templateSectionSelect,
    })
    .then(toDomainSection)

export const removeSection = (sectionId: string): Promise<void> =>
  prisma.planTemplateSection.delete({ where: { id: sectionId } }).then(() => undefined)

export const addExerciseToSection = (
  sectionId: string,
  data: CreateTemplateExerciseInput,
): Promise<DomainTemplateExercise> =>
  prisma.planTemplateExercise
    .create({
      data: {
        templateSectionId: sectionId,
        exerciseId: data.exerciseId,
        sortOrder: data.sortOrder,
        sets: data.sets ?? null,
        reps: data.reps ?? null,
        durationSeconds: data.durationSeconds ?? null,
        weight: data.weight ?? null,
        rpe: data.rpe ?? null,
        restBetweenSets: data.restBetweenSets ?? null,
        supersetGroupId: data.supersetGroupId ?? null,
        supersetOrder: data.supersetOrder ?? null,
        notes: data.notes ?? null,
      },
      select: templateExerciseSelect,
    })
    .then(toDomainExerciseInSection)

export const removeExerciseFromSection = (exerciseId: string): Promise<void> =>
  prisma.planTemplateExercise.delete({ where: { id: exerciseId } }).then(() => undefined)

export const updateExerciseInSection = (
  exerciseId: string,
  data: Partial<CreateTemplateExerciseInput>,
): Promise<DomainTemplateExercise> =>
  prisma.planTemplateExercise
    .update({
      where: { id: exerciseId },
      data: {
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.sets !== undefined && { sets: data.sets }),
        ...(data.reps !== undefined && { reps: data.reps }),
        ...(data.durationSeconds !== undefined && { durationSeconds: data.durationSeconds }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.rpe !== undefined && { rpe: data.rpe }),
        ...(data.restBetweenSets !== undefined && { restBetweenSets: data.restBetweenSets }),
        ...(data.supersetGroupId !== undefined && { supersetGroupId: data.supersetGroupId }),
        ...(data.supersetOrder !== undefined && { supersetOrder: data.supersetOrder }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      select: templateExerciseSelect,
    })
    .then(toDomainExerciseInSection)
