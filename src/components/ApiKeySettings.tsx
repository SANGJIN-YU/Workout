import { useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'

interface Props {
  currentKey: string | null
  onSave: (key: string | null) => void
}

export function ApiKeySettings({ currentKey, onSave }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(currentKey ?? '')

  return (
    <div className="card settings-card">
      <button type="button" className="link-btn" onClick={() => setOpen((v) => !v)}>
        {open ? t('apiKeySettings', 'closeLabel') : t('apiKeySettings', 'openLabel')} ·{' '}
        {currentKey ? t('apiKeySettings', 'registered') : t('apiKeySettings', 'notRegistered')}
      </button>
      {open && (
        <div className="form-stack">
          <p className="muted small">{t('apiKeySettings', 'description')}</p>
          <label className="field">
            <span>{t('apiKeySettings', 'keyLabel')}</span>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <div className="row-inline">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSave(draft.trim() || null)
                setOpen(false)
              }}
            >
              {t('apiKeySettings', 'save')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDraft('')
                onSave(null)
              }}
            >
              {t('apiKeySettings', 'deleteKey')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
