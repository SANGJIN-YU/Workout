import { useState } from 'react'
import type { BodyInfo } from '../types'

interface Props {
  initial?: BodyInfo
  onSubmit: (info: BodyInfo) => void
  submitLabel: string
}

export function BodyInfoForm({ initial, onSubmit, submitLabel }: Props) {
  const [heightCm, setHeightCm] = useState(initial?.heightCm ?? 170)
  const [weightKg, setWeightKg] = useState(initial?.weightKg ?? 70)
  const [age, setAge] = useState(initial?.age ?? 30)
  const [sex, setSex] = useState<BodyInfo['sex']>(initial?.sex ?? 'unspecified')

  return (
    <form
      className="card form-stack"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ heightCm, weightKg, age, sex })
      }}
    >
      <h2>신체 정보</h2>
      <label className="field">
        <span>키 (cm)</span>
        <input
          type="number"
          min={100}
          max={250}
          value={heightCm}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          required
        />
      </label>
      <label className="field">
        <span>몸무게 (kg)</span>
        <input
          type="number"
          min={30}
          max={300}
          step={0.1}
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          required
        />
      </label>
      <label className="field">
        <span>나이</span>
        <input type="number" min={10} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} required />
      </label>
      <label className="field">
        <span>성별 (선택)</span>
        <select value={sex} onChange={(e) => setSex(e.target.value as BodyInfo['sex'])}>
          <option value="unspecified">선택 안 함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </label>
      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  )
}
