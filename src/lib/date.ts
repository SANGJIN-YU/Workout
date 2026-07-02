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

export function formatWeekLabel(weekStartIso: string): string {
  const d = new Date(`${weekStartIso}T00:00:00`)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' 주'
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
