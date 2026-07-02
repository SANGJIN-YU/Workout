import { useState } from 'react'

interface Props {
  currentKey: string | null
  onSave: (key: string | null) => void
}

export function ApiKeySettings({ currentKey, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(currentKey ?? '')

  return (
    <div className="card settings-card">
      <button type="button" className="link-btn" onClick={() => setOpen((v) => !v)}>
        {open ? '설정 닫기' : 'AI API 키 설정'} {currentKey ? '· 등록됨' : '· 미등록'}
      </button>
      {open && (
        <div className="form-stack">
          <p className="muted small">
            Anthropic API 키는 이 브라우저의 로컬 저장소에만 저장되며 서버로 전송되지 않습니다. 처방 생성 버튼을 누를 때만 Anthropic
            API로 직접 요청을 보냅니다.
          </p>
          <label className="field">
            <span>Anthropic API Key</span>
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
              저장
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDraft('')
                onSave(null)
              }}
            >
              키 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
