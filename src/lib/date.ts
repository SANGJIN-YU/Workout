export function mondayOf(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function todayMondayIso(): string {
  return mondayOf(new Date())
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Sunday (last day) of the week that starts on weekStart (a Monday). */
export function weekEndIso(weekStart: string): string {
  return addDaysIso(weekStart, 6)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Today if it falls within [weekStart, weekEnd], otherwise weekStart — a sensible default day to attach a new exercise entry to. */
export function defaultDateForWeek(weekStart: string): string {
  const today = todayIso()
  return today >= weekStart && today <= weekEndIso(weekStart) ? today : weekStart
}

/** Clamps an arbitrary date into the [weekStart, weekEnd] range, e.g. for stale entries when navigating weeks. */
export function clampDateToWeek(dateIso: string, weekStart: string): string {
  const end = weekEndIso(weekStart)
  if (dateIso < weekStart) return weekStart
  if (dateIso > end) return end
  return dateIso
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
