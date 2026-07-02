import { useState } from 'react'
import type { ExerciseLog, WeekLog, WeightSet } from '../types'
import { BIG_THREE_EXERCISES } from '../types'
import { newId } from '../lib/date'
import { weekVolume } from '../lib/volume'

interface Props {
  weekStart: string
  initial?: WeekLog
  onSave: (week: WeekLog) => void
}

function emptyExercise(name = ''): ExerciseLog {
  return { id: newId(), name, sets: [{ weightKg: 0, reps: 0 }] }
}

export function WorkoutLogForm({ weekStart, initial, onSave }: Props) {
  const [exercises, setExercises] = useState<ExerciseLog[]>(initial?.exercises ?? [emptyExercise('벤치프레스')])

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
        <h2>이번 주 웨이트 기록</h2>
        <span className="volume-badge">총 볼륨 {Math.round(total).toLocaleString()}kg</span>
      </div>

      <div className="quick-add">
        {BIG_THREE_EXERCISES.map((name) => (
          <button type="button" key={name} className="chip" onClick={() => addExercise(name)}>
            + {name}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => addExercise('')}>
          + 직접 입력
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
                placeholder="운동 이름 (예: 스쿼트)"
                value={ex.name}
                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
              />
              <div className="row-inline">
                <span className="muted">{Math.round(exVolume).toLocaleString()}kg</span>
                <button type="button" className="icon-btn" onClick={() => removeExercise(ex.id)} aria-label="운동 삭제">
                  ✕
                </button>
              </div>
            </div>
            <table className="set-table">
              <thead>
                <tr>
                  <th>세트</th>
                  <th>무게(kg)</th>
                  <th>횟수</th>
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
                      <button type="button" className="icon-btn" onClick={() => removeSet(ex.id, i)} aria-label="세트 삭제">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="chip" onClick={() => addSet(ex.id)}>
              + 세트 추가
            </button>
          </div>
        )
      })}

      <button
        type="button"
        className="btn-primary"
        onClick={() => onSave({ ...draftWeek, exercises: exercises.filter((ex) => ex.name.trim() !== '') })}
      >
        이번 주 기록 저장
      </button>
    </div>
  )
}
