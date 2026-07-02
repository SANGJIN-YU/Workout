import { parsePrescriptionResponse, type ParsedPrescription } from './prescriptionPrompt'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-5'

export class AiRequestError extends Error {}

/** 주 1회 호출되는 처방 생성 API. 브라우저에서 직접 Anthropic Messages API를 호출한다. */
export async function requestPrescriptionFromAi(apiKey: string, prompt: string): Promise<ParsedPrescription> {
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
    throw new AiRequestError(`AI 처방 요청 실패 (${response.status}): ${body.slice(0, 300)}`)
  }

  const data = await response.json()
  const text: string | undefined = data?.content?.[0]?.text
  if (!text) throw new AiRequestError('AI 응답에 처방 내용이 없습니다.')
  return parsePrescriptionResponse(text)
}
