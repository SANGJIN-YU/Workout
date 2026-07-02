import { useTranslation } from '../i18n/LanguageContext'
import type { Locale } from '../types'

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <div className="language-switcher" role="group" aria-label="Language">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`language-option ${locale === opt.value ? 'active' : ''}`}
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
