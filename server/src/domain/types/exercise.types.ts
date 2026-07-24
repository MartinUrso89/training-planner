export interface DomainExercise {
  id: string
  name: string
  muscleGroup: string
  videoUrl: string | null
  description: string | null
  createdBy: string
  createdAt: Date
}

export interface CreateExerciseInput {
  name: string
  muscleGroup: string
  videoUrl?: string
  description?: string
}

export interface UpdateExerciseInput {
  name?: string
  muscleGroup?: string
  videoUrl?: string
  description?: string
}
