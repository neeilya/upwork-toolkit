import { AiSettings } from '@/utils/aiSettings'
import { findProvider, ModelPreset } from '@/utils/aiCatalog'
import { AiErrorCode } from '@/utils/runtime'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogle } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { APICallError, createGateway, LanguageModel, streamText } from 'ai'

const DIAGNOSTIC_BODY_LIMIT = 500

export type AiFailure = {
  code: AiErrorCode
  /** False for failures the user can fix themselves; those are not bugs. */
  reportable: boolean
  diagnostics: { url?: string; status?: number; body?: string }
}

const createModel = (settings: AiSettings): LanguageModel => {
  if (settings.mode === 'gateway') {
    return createGateway({ apiKey: settings.gatewayApiKey })(
      settings.gatewayModel
    )
  }

  const provider = findProvider(settings.provider)

  if (!provider) {
    throw new Error(`Unknown AI provider: ${settings.provider}`)
  }

  const apiKey = settings.apiKey

  switch (provider.kind) {
    case 'openai':
      return createOpenAI({ apiKey })(settings.model)
    case 'google':
      return createGoogle({ apiKey })(settings.model)
    case 'anthropic':
      // The Claude API rejects browser-originated requests unless they opt in.
      return createAnthropic({
        apiKey,
        headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
      })(settings.model)
    case 'openai-compatible':
      return createOpenAICompatible({
        apiKey,
        name: provider.id,
        baseURL: provider.baseUrl,
      })(settings.model)
  }
}

/**
 * Streams a cover letter from the configured provider, delivering each token
 * through `onChunk` as it arrives.
 */
const generateCoverLetter = async (props: {
  settings: AiSettings
  prompt: string
  signal?: AbortSignal
  onChunk: (chunk: string) => void
}): Promise<void> => {
  const result = streamText({
    model: createModel(props.settings),
    prompt: props.prompt,
    abortSignal: props.signal,
  })

  let received = false

  for await (const part of result.fullStream) {
    if (part.type === 'text-delta') {
      received = true
      props.onChunk(part.text)
      continue
    }

    // `streamText` reports a failure as an in-band part and then closes the
    // stream normally, so consuming `textStream` instead would report success
    // with an empty result.
    if (part.type === 'error') {
      throw part.error
    }
  }

  if (!received) {
    throw new Error('The provider returned an empty cover letter')
  }
}

const fetchGatewayModels = async (apiKey: string): Promise<ModelPreset[]> => {
  const { models } = await createGateway({ apiKey }).getAvailableModels()

  return models
    .filter(
      (model) => model.modelType == null || model.modelType === 'language'
    )
    .map((model) => ({ id: model.id, label: model.name || model.id }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Provider error bodies quote the rejected credential back at you. */
const redactSecrets = (body: string) =>
  body.replace(/[A-Za-z0-9_-]{24,}/g, '[redacted]')

const matchesQuota = (body: string) =>
  /insufficient_quota|insufficient credit|exceeded your current quota|billing|payment required/i.test(
    body
  )

const matchesUnknownModel = (body: string) =>
  /model.{0,30}(not found|does not exist|is not available|invalid)/i.test(body)

const classifyError = (error: unknown): AiFailure => {
  if (!APICallError.isInstance(error)) {
    return { code: 'GENERATION_FAILED', reportable: true, diagnostics: {} }
  }

  const body = (error.responseBody ?? '').slice(0, DIAGNOSTIC_BODY_LIMIT)
  const diagnostics = {
    url: error.url,
    status: error.statusCode,
    body: redactSecrets(body),
  }

  const userFixable = (code: AiErrorCode): AiFailure => ({
    code,
    reportable: false,
    diagnostics,
  })

  switch (error.statusCode) {
    case 401:
    case 403:
      return userFixable('INVALID_API_KEY')
    case 402:
      return userFixable('INSUFFICIENT_QUOTA')
    case 404:
      return userFixable('MODEL_UNAVAILABLE')
    case 429:
      // OpenAI never returns 402; it signals an exhausted balance with a 429
      // whose body carries `insufficient_quota`.
      return userFixable(
        matchesQuota(body) ? 'INSUFFICIENT_QUOTA' : 'RATE_LIMITED'
      )
    case 400:
      if (matchesUnknownModel(body)) return userFixable('MODEL_UNAVAILABLE')
      break
  }

  return { code: 'GENERATION_FAILED', reportable: true, diagnostics }
}

export default { generateCoverLetter, fetchGatewayModels, classifyError }
