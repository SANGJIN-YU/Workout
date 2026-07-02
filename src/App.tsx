import { useMemo, useState } from 'react'
import type { AppState, Prescription, UserProfile, WeekLog } from './types'
import { addPrescription, loadState, saveApiKey, saveProfile, upsertWeek } from './lib/storage'
import { sortedWeeklyPoints } from './lib/volume'
import { generatePrescription } from './lib/prescription'
import { mondayOf } from './lib/date'
import { formatWeekLabel } from './i18n/format'
import { useTranslation } from './i18n/LanguageContext'
import { Onboarding } from './components/Onboarding'
import { WorkoutLogForm } from './components/WorkoutLogForm'
import { TrendChart } from './components/TrendChart'
import { PrescriptionCard } from './components/PrescriptionCard'
import { ApiKeySettings } from './components/ApiKeySettings'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import './App.css'

function addWeeks(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + delta * 7)
  return mondayOf(d)
}

export default function App() {
  const { t, locale } = useTranslation()
  const [state, setState] = useState<AppState>(() => loadState())
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => mondayOf(new Date()))
  const [prescriptionLoading, setPrescriptionLoading] = useState(false)
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null)

  const points = useMemo(() => sortedWeeklyPoints(state.weeks), [state.weeks])
  const selectedWeek = state.weeks.find((w) => w.weekStart === selectedWeekStart)
  const latestPrescription = useMemo(() => {
    if (state.prescriptions.length === 0) return null
    return [...state.prescriptions].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0]
  }, [state.prescriptions])

  function handleOnboardingComplete(profile: UserProfile, seedWeeks: WeekLog[]) {
    let next = saveProfile(profile)
    for (const week of seedWeeks) {
      next = upsertWeek(week)
    }
    setState(next)
    if (seedWeeks.length > 0) {
      setSelectedWeekStart(mondayOf(new Date()))
    }
  }

  function handleSaveWeek(week: WeekLog) {
    const next = upsertWeek(week)
    setState(next)
  }

  async function handleGeneratePrescription() {
    if (!state.profile) return
    setPrescriptionLoading(true)
    setPrescriptionError(null)
    try {
      const prescription: Prescription = await generatePrescription(
        state.profile.bodyInfo,
        state.weeks,
        state.anthropicApiKey,
        locale,
      )
      setState(addPrescription(prescription))
    } catch (err) {
      setPrescriptionError(err instanceof Error ? err.message : t('errors', 'genericFailure'))
    } finally {
      setPrescriptionLoading(false)
    }
  }

  function handleSaveApiKey(key: string | null) {
    setState(saveApiKey(key))
  }

  if (!state.profile) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <LanguageSwitcher />
          <h1>{t('app', 'title')}</h1>
          <p className="tagline">{t('app', 'tagline')}</p>
        </header>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <LanguageSwitcher />
        <h1>{t('app', 'title')}</h1>
        <p className="tagline">{t('app', 'tagline')}</p>
      </header>

      <section className="week-nav card">
        <button
          className="icon-btn"
          onClick={() => setSelectedWeekStart((w) => addWeeks(w, -1))}
          aria-label={t('weekNav', 'prevWeek')}
        >
          ◀
        </button>
        <span className="week-label">{formatWeekLabel(selectedWeekStart, locale)}</span>
        <button
          className="icon-btn"
          onClick={() => setSelectedWeekStart((w) => addWeeks(w, 1))}
          aria-label={t('weekNav', 'nextWeek')}
        >
          ▶
        </button>
      </section>

      <WorkoutLogForm weekStart={selectedWeekStart} initial={selectedWeek} onSave={handleSaveWeek} />

      <TrendChart points={points} targetVolumeKg={latestPrescription?.targetVolumeKg} />

      <PrescriptionCard
        prescription={latestPrescription}
        loading={prescriptionLoading}
        error={prescriptionError}
        canGenerate={state.weeks.length > 0}
        hasApiKey={!!state.anthropicApiKey}
        onGenerate={handleGeneratePrescription}
      />

      <ApiKeySettings currentKey={state.anthropicApiKey} onSave={handleSaveApiKey} />
    </div>
  )
}
