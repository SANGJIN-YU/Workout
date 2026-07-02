import type { Locale } from '../types'
import { translate } from '../i18n/translations'
import { parsePrescriptionResponse, type ParsedPrescription } from './prescriptionPrompt'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-5'

export class AiRequestError extends Error {}

/** Prescription-generation API called once a week. Calls the Anthropic Messages API directly from the browser. */
export async function requestPrescriptionFromAi(
  apiKey: string,
  prompt: string,
  locale: Locale,
): Promise<ParsedPrescription> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new AiRequestError(translate(locale, 'errors', 'aiRequestFailed', { status: response.status, body: body.slice(0, 300) }))
  }

  const data = await response.json()
  const text: string | undefined = data?.content?.[0]?.text
  if (!text) throw new AiRequestError(translate(locale, 'errors', 'aiNoContent'))
  return parsePrescriptionResponse(text, locale)
}
