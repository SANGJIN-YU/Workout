import type { AppState, Prescription, UserProfile, WeekLog } from '../types'

const STORAGE_KEY = 'trendfit.state.v1'

function emptyState(): AppState {
  return { profile: null, weeks: [], prescriptions: [], anthropicApiKey: null }
}

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyState()
  try {
    const parsed = JSON.parse(raw) as AppState
    return { ...emptyState(), ...parsed }
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function saveProfile(profile: UserProfile): AppState {
  const state = loadState()
  const next = { ...state, profile }
  saveState(next)
  return next
}

export function upsertWeek(week: WeekLog): AppState {
  const state = loadState()
  const idx = state.weeks.findIndex((w) => w.id === week.id)
  const weeks = [...state.weeks]
  if (idx >= 0) weeks[idx] = week
  else weeks.push(week)
  weeks.sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  const next = { ...state, weeks }
  saveState(next)
  return next
}

export function deleteWeek(weekId: string): AppState {
  const state = loadState()
  const next = { ...state, weeks: state.weeks.filter((w) => w.id !== weekId) }
  saveState(next)
  return next
}

export function addPrescription(prescription: Prescription): AppState {
  const state = loadState()
  const prescriptions = [...state.prescriptions.filter((p) => p.weekStart !== prescription.weekStart), prescription]
  const next = { ...state, prescriptions }
  saveState(next)
  return next
}

export function saveApiKey(key: string | null): AppState {
  const state = loadState()
  const next = { ...state, anthropicApiKey: key }
  saveState(next)
  return next
}

export function resetAll(): AppState {
  localStorage.removeItem(STORAGE_KEY)
  return emptyState()
}
