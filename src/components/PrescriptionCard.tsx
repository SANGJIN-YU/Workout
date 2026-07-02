import type { Prescription } from '../types'

interface Props {
  prescription: Prescription | null
  loading: boolean
  error: string | null
  canGenerate: boolean
  hasApiKey: boolean
  onGenerate: () => void
}

export function PrescriptionCard({ prescription, loading, error, canGenerate, hasApiKey, onGenerate }: Props) {
  return (
    <div className="card prescription-card">
      <div className="row-between">
        <h2>다음 주 처방</h2>
        {prescription && (
          <span className={`source-badge ${prescription.source}`}>
            {prescription.source === 'ai' ? 'AI 처방' : '규칙 기반 처방 (데모)'}
          </span>
        )}
      </div>

      {!hasApiKey && (
        <p className="muted small">
          AI API 키가 없어 규칙 기반 처방으로 동작합니다. 실제 AI 처방을 받으려면 아래 설정에서 Anthropic API 키를 등록하세요.
        </p>
      )}

      {prescription ? (
        <div className="mission">
          <p className="mission-title">{prescription.missionTitle}</p>
          <div className="mission-stats">
            <div>
              <span className="stat-label">지난주</span>
              <span className="stat-value">{Math.round(prescription.previousVolumeKg).toLocaleString()}kg</span>
            </div>
            <div className="stat-arrow">→</div>
            <div>
              <span className="stat-label">이번 목표</span>
              <span className="stat-value accent">{Math.round(prescription.targetVolumeKg).toLocaleString()}kg</span>
            </div>
            <div className={`stat-delta ${prescription.changePercent >= 0 ? 'up' : 'down'}`}>
              {prescription.changePercent >= 0 ? '+' : ''}
              {prescription.changePercent.toFixed(1)}%
            </div>
          </div>
          <p className="rationale">{prescription.rationale}</p>
        </div>
      ) : (
        <p className="muted">아직 처방을 받지 않았습니다. 이번 주 기록을 저장한 뒤 처방을 받아보세요.</p>
      )}

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" disabled={!canGenerate || loading} onClick={onGenerate}>
        {loading ? '처방 생성 중…' : '다음 주 처방 받기'}
      </button>
    </div>
  )
}
