import { useState } from 'react'
import type { BodyInfo, UserProfile, WeekLog } from '../types'
import { BodyInfoForm } from './BodyInfoForm'
import { mondayOf, newId } from '../lib/date'

interface Props {
  onComplete: (profile: UserProfile, seedWeeks: WeekLog[]) => void
}

function seedWeekFromVolume(weekStart: string, totalVolumeKg: number): WeekLog {
  return {
    id: newId(),
    weekStart,
    exercises: [
      {
        id: newId(),
        name: '3대 운동 합산 (초기 입력)',
        sets: [{ weightKg: totalVolumeKg, reps: 1 }],
      },
    ],
  }
}

export function Onboarding({ onComplete }: Props) {
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
    const weeks: WeekLog[] = seedVolumes
      .map((v, i) => ({ v: Number(v), i }))
      .filter(({ v }) => v > 0)
      .map(({ v, i }) => {
        const weeksAgo = seedVolumes.length - i
        const d = new Date(today)
        d.setDate(d.getDate() - weeksAgo * 7)
        return seedWeekFromVolume(mondayOf(d), v)
      })
    onComplete(profile, weeks)
  }

  if (step === 'body') {
    return (
      <div className="onboarding">
        <p className="eyebrow">1 / 2 · 기준 정보</p>
        <BodyInfoForm onSubmit={handleBodySubmit} submitLabel="다음" />
      </div>
    )
  }

  if (step === 'type') {
    return (
      <div className="onboarding">
        <p className="eyebrow">2 / 2 · 시작 방식 선택</p>
        <div className="card form-stack">
          <h2>운동 경력이 있으신가요?</h2>
          <p className="muted">
            처음이면 이번 주는 편하게 기록만 남기고, 2주차부터 처방을 시작합니다. 경력자는 최근 3주 볼륨을 입력하면 1주차부터 바로
            처방을 받을 수 있습니다.
          </p>
          <div className="choice-row">
            <button className="btn-secondary" onClick={chooseBeginner}>
              처음이에요 — 기준선부터 측정할게요
            </button>
            <button className="btn-primary" onClick={chooseExperienced}>
              해봤어요 — 최근 기록으로 바로 시작할게요
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding">
      <p className="eyebrow">2 / 2 · 최근 볼륨 입력</p>
      <div className="card form-stack">
        <h2>최근 3주 3대 운동 총 볼륨</h2>
        <p className="muted">스쿼트·벤치프레스·데드리프트 합산 총 볼륨(무게 × 횟수 × 세트)을 아는 만큼만 입력하세요.</p>
        {seedVolumes.map((v, i) => (
          <label className="field" key={i}>
            <span>{seedVolumes.length - i}주 전 총 볼륨 (kg)</span>
            <input
              type="number"
              min={0}
              placeholder="예: 4000"
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
          시작하기
        </button>
      </div>
    </div>
  )
}
