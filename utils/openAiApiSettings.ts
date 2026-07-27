import { storage } from '#imports'
import openAiApiConfigStorage, {
  OpenAiApiConfig,
  providerIds,
} from '@/utils/openAiApiConfig'
import openAiApiKeyStorage from '@/utils/openAiApiKey'

const namespace = 'sync:__OPENAI_API_SETTINGS'

export type OpenAiApiSettings = {
  apiKey: string
  config: OpenAiApiConfig
}

const isSettings = (value: unknown): value is OpenAiApiSettings => {
  if (!value || typeof value !== 'object') return false

  const settings = value as Partial<OpenAiApiSettings>
  return (
    typeof settings.apiKey === 'string' &&
    !!settings.config &&
    typeof settings.config.model === 'string' &&
    providerIds.includes(settings.config.provider)
  )
}

const get = async (): Promise<OpenAiApiSettings> => {
  const settings = await storage.getItem<unknown>(namespace, {
    fallback: null,
  })

  if (isSettings(settings)) return settings

  // Production users only have the original OpenAI API key. Keep it and use
  // the default OpenAI configuration until their next save.
  return {
    apiKey: await openAiApiKeyStorage.get(),
    config: openAiApiConfigStorage.defaultConfig,
  }
}

const save = async (settings: OpenAiApiSettings) => {
  await storage.setItem<OpenAiApiSettings>(namespace, settings)
  return settings
}

export default { get, save }
