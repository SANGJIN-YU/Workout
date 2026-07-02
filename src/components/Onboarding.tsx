import { useState } from 'react'
import type { BodyInfo, UserProfile, WeekLog } from '../types'
import { BodyInfoForm } from './BodyInfoForm'
import { mondayOf, newId } from '../lib/date'
import { useTranslation } from '../i18n/LanguageContext'

interface Props {
  onComplete: (profile: UserProfile, seedWeeks: WeekLog[]) => void
}

function seedWeekFromVolume(weekStart: string, totalVolumeKg: number, exerciseName: string): WeekLog {
  return {
    id: newId(),
    weekStart,
    exercises: [
      {
        id: newId(),
        name: exerciseName,
        sets: [{ weightKg: totalVolumeKg, reps: 1 }],
      },
    ],
  }
}

export function Onboarding({ onComplete }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'body' | 'type' | 'experienced-seed'>('body')
  const [bodyInfo, setBodyInfo] = useState<BodyInfo | null>(null)
  const [seedVolumes, setSeedVolumes] = useState<string[]>(['', '', ''])

  function handleBodySubmit(info: BodyInfo) {
    setBodyInfo(info)
    setStep('type')
  }

  function chooseBeginner() {
    if (!bodyInfo) return
    const profile: UserProfile = { onboardingType: 'beginner', bodyInfo, createdAt: new Date().toISOString() }
    onComplete(profile, [])
  }

  function chooseExperienced() {
    setStep('experienced-seed')
  }

  function submitExperiencedSeed() {
    if (!bodyInfo) return
    const profile: UserProfile = { onboardingType: 'experienced', bodyInfo, createdAt: new Date().toISOString() }
    const today = new Date()
    const seedExerciseName = t('onboarding', 'seedExerciseName')
    const weeks: WeekLog[] = seedVolumes
      .map((v, i) => ({ v: Number(v), i }))
      .filter(({ v }) => v > 0)
      .map(({ v, i }) => {
        const weeksAgo = seedVolumes.length - i
        const d = new Date(today)
        d.setDate(d.getDate() - weeksAgo * 7)
        return seedWeekFromVolume(mondayOf(d), v, seedExerciseName)
      })
    onComplete(profile, weeks)
  }

  if (step === 'body') {
    return (
      <div className="onboarding">
        <p className="eyebrow">{t('onboarding', 'step1Eyebrow')}</p>
        <BodyInfoForm onSubmit={handleBodySubmit} submitLabel={t('bodyInfo', 'next')} />
      </div>
    )
  }

  if (step === 'type') {
    return (
      <div className="onboarding">
        <p className="eyebrow">{t('onboarding', 'step2Eyebrow')}</p>
        <div className="card form-stack">
          <h2>{t('onboarding', 'chooseTypeTitle')}</h2>
          <p className="muted">{t('onboarding', 'chooseTypeDesc')}</p>
          <div className="choice-row">
            <button className="btn-secondary" onClick={chooseBeginner}>
              {t('onboarding', 'beginnerBtn')}
            </button>
            <button className="btn-primary" onClick={chooseExperienced}>
              {t('onboarding', 'experiencedBtn')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding">
      <p className="eyebrow">{t('onboarding', 'step2SeedEyebrow')}</p>
      <div className="card form-stack">
        <h2>{t('onboarding', 'seedTitle')}</h2>
        <p className="muted">{t('onboarding', 'seedDesc')}</p>
        {seedVolumes.map((v, i) => (
          <label className="field" key={i}>
            <span>{t('onboarding', 'weeksAgoLabel', { count: seedVolumes.length - i })}</span>
            <input
              type="number"
              min={0}
              placeholder={t('onboarding', 'seedPlaceholder')}
              value={v}
              onChange={(e) => {
                const next = [...seedVolumes]
                next[i] = e.target.value
                setSeedVolumes(next)
              }}
            />
          </label>
        ))}
        <button className="btn-primary" onClick={submitExperiencedSeed}>
          {t('onboarding', 'startBtn')}
        </button>
      </div>
    </div>
  )
}
