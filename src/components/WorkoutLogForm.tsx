import { useState } from 'react'
import type { ExerciseLog, WeekLog, WeightSet } from '../types'
import { BIG_THREE_EXERCISES } from '../types'
import { newId } from '../lib/date'
import { weekVolume } from '../lib/volume'
import { formatNumber } from '../i18n/format'
import { useTranslation } from '../i18n/LanguageContext'

interface Props {
  weekStart: string
  initial?: WeekLog
  onSave: (week: WeekLog) => void
}

function emptyExercise(name = ''): ExerciseLog {
  return { id: newId(), name, sets: [{ weightKg: 0, reps: 0 }] }
}

export function WorkoutLogForm({ weekStart, initial, onSave }: Props) {
  const { t, locale } = useTranslation()
  const [exercises, setExercises] = useState<ExerciseLog[]>(
    initial?.exercises ?? [emptyExercise(t('workoutLog', 'defaultExerciseName'))],
  )

  const draftWeek: WeekLog = { id: initial?.id ?? newId(), weekStart, exercises }
  const total = weekVolume(draftWeek)

  function updateExercise(id: string, patch: Partial<ExerciseLog>) {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)))
  }

  function updateSet(exerciseId: string, setIndex: number, patch: Partial<WeightSet>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)) }
          : ex,
      ),
    )
  }

  function addSet(exerciseId: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: [...ex.sets, { weightKg: 0, reps: 0 }] } : ex)),
    )
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) } : ex)),
    )
  }

  function addExercise(name = '') {
    setExercises((prev) => [...prev, emptyExercise(name)])
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  return (
    <div className="card form-stack">
      <div className="row-between">
        <h2>{t('workoutLog', 'title')}</h2>
        <span className="volume-badge">{t('workoutLog', 'totalVolume', { value: `${formatNumber(total, locale)}kg` })}</span>
      </div>

      <div className="quick-add">
        {BIG_THREE_EXERCISES[locale].map((name) => (
          <button type="button" key={name} className="chip" onClick={() => addExercise(name)}>
            + {name}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => addExercise('')}>
          {t('workoutLog', 'quickAddCustom')}
        </button>
      </div>

      {exercises.map((ex) => {
        const exVolume = ex.sets.reduce((s, set) => s + set.weightKg * set.reps, 0)
        return (
          <div className="exercise-block" key={ex.id}>
            <div className="row-between">
              <input
                className="exercise-name"
                type="text"
                placeholder={t('workoutLog', 'exerciseNamePlaceholder')}
                value={ex.name}
                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
              />
              <div className="row-inline">
                <span className="muted">{formatNumber(exVolume, locale)}kg</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeExercise(ex.id)}
                  aria-label={t('workoutLog', 'deleteExercise')}
                >
                  ✕
                </button>
              </div>
            </div>
            <table className="set-table">
              <thead>
                <tr>
                  <th>{t('workoutLog', 'setHeader')}</th>
                  <th>{t('workoutLog', 'weightHeader')}</th>
                  <th>{t('workoutLog', 'repsHeader')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={set.weightKg}
                        onChange={(e) => updateSet(ex.id, i, { weightKg: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={set.reps}
                        onChange={(e) => updateSet(ex.id, i, { reps: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeSet(ex.id, i)}
                        aria-label={t('workoutLog', 'deleteSet')}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="chip" onClick={() => addSet(ex.id)}>
              {t('workoutLog', 'addSet')}
            </button>
          </div>
        )
      })}

      <button
        type="button"
        className="btn-primary"
        onClick={() => onSave({ ...draftWeek, exercises: exercises.filter((ex) => ex.name.trim() !== '') })}
      >
        {t('workoutLog', 'saveWeek')}
      </button>
    </div>
  )
}
