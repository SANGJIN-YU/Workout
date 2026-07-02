import type { Prescription } from '../types'
import { formatNumber } from '../i18n/format'
import { useTranslation } from '../i18n/LanguageContext'

interface Props {
  prescription: Prescription | null
  loading: boolean
  error: string | null
  canGenerate: boolean
  hasApiKey: boolean
  onGenerate: () => void
}

export function PrescriptionCard({ prescription, loading, error, canGenerate, hasApiKey, onGenerate }: Props) {
  const { t, locale } = useTranslation()

  return (
    <div className="card prescription-card">
      <div className="row-between">
        <h2>{t('prescription', 'title')}</h2>
        {prescription && (
          <span className={`source-badge ${prescription.source}`}>
            {prescription.source === 'ai' ? t('prescription', 'aiLabel') : t('prescription', 'ruleBasedLabel')}
          </span>
        )}
      </div>

      {!hasApiKey && <p className="muted small">{t('prescription', 'noKeyNotice')}</p>}

      {prescription ? (
        <div className="mission">
          <p className="mission-title">{prescription.missionTitle}</p>
          <div className="mission-stats">
            <div>
              <span className="stat-label">{t('prescription', 'lastWeek')}</span>
              <span className="stat-value">{formatNumber(prescription.previousVolumeKg, locale)}kg</span>
            </div>
            <div className="stat-arrow">→</div>
            <div>
              <span className="stat-label">{t('prescription', 'thisTarget')}</span>
              <span className="stat-value accent">{formatNumber(prescription.targetVolumeKg, locale)}kg</span>
            </div>
            <div className={`stat-delta ${prescription.changePercent >= 0 ? 'up' : 'down'}`}>
              {prescription.changePercent >= 0 ? '+' : ''}
              {prescription.changePercent.toFixed(1)}%
            </div>
          </div>
          <p className="rationale">{prescription.rationale}</p>
        </div>
      ) : (
        <p className="muted">{t('prescription', 'noPrescriptionYet')}</p>
      )}

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" disabled={!canGenerate || loading} onClick={onGenerate}>
        {loading ? t('prescription', 'generating') : t('prescription', 'generateBtn')}
      </button>
    </div>
  )
}
