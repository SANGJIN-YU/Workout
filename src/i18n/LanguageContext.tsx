import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../types'
import { translate, type TranslationDict } from './translations'
import { saveLocale } from '../lib/storage'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: <S extends keyof TranslationDict>(
    section: S,
    key: keyof TranslationDict[S],
    vars?: Record<string, string | number>,
  ) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  function setLocale(next: Locale) {
    setLocaleState(next)
    saveLocale(next)
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (section, key, vars) => translate(locale, section, key, vars),
    }),
    [locale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider')
  return ctx
}
