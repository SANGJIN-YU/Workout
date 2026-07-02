export type OnboardingType = 'beginner' | 'experienced'

export interface BodyInfo {
  heightCm: number
  weightKg: number
  age: number
  sex?: 'male' | 'female' | 'unspecified'
}

export interface WeightSet {
  weightKg: number
  reps: number
}

export interface ExerciseLog {
  id: string
  name: string
  sets: WeightSet[]
}

/** One week of weight-training records. weekStart is the Monday of that week, ISO date (YYYY-MM-DD). */
export interface WeekLog {
  id: string
  weekStart: string
  exercises: ExerciseLog[]
}

export type PrescriptionSource = 'ai' | 'rule-based'

export interface Prescription {
  id: string
  /** The Monday of the week this prescription targets (the upcoming week). */
  weekStart: string
  missionTitle: string
  targetVolumeKg: number
  previousVolumeKg: number
  changePercent: number
  rationale: string
  source: PrescriptionSource
  generatedAt: string
}

export interface UserProfile {
  onboardingType: OnboardingType
  bodyInfo: BodyInfo
  createdAt: string
}

export interface AppState {
  profile: UserProfile | null
  weeks: WeekLog[]
  prescriptions: Prescription[]
  anthropicApiKey: string | null
}

export const BIG_THREE_EXERCISES = ['스쿼트', '벤치프레스', '데드리프트'] as const
