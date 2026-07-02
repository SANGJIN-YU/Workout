import { useState } from 'react'
import type { BodyInfo } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface Props {
  initial?: BodyInfo
  onSubmit: (info: BodyInfo) => void
  submitLabel: string
}

export function BodyInfoForm({ initial, onSubmit, submitLabel }: Props) {
  const { t } = useTranslation()
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
      <h2>{t('bodyInfo', 'title')}</h2>
      <label className="field">
        <span>{t('bodyInfo', 'height')}</span>
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
        <span>{t('bodyInfo', 'weight')}</span>
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
        <span>{t('bodyInfo', 'age')}</span>
        <input type="number" min={10} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} required />
      </label>
      <label className="field">
        <span>{t('bodyInfo', 'sex')}</span>
        <select value={sex} onChange={(e) => setSex(e.target.value as BodyInfo['sex'])}>
          <option value="unspecified">{t('bodyInfo', 'sexNone')}</option>
          <option value="male">{t('bodyInfo', 'sexMale')}</option>
          <option value="female">{t('bodyInfo', 'sexFemale')}</option>
        </select>
      </label>
      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  )
}
