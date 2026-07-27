import { browser, storage } from '#imports'

const DEFAULT_MODEL = 'gpt-4o-mini'

const namespace = 'sync:__OPENAI_API_CONFIG'

export type ApiProvider =
  | 'openai'
  | 'openrouter'
  | 'groq'
  | 'deepseek'

type ApiProviderConfig = {
  apiBaseUrl: string
  defaultModel: string
  label: string
  models: string[]
}

const providers: Record<ApiProvider, ApiProviderConfig> = {
  openai: {
    apiBaseUrl: 'https://api.openai.com/v1',
    defaultModel: DEFAULT_MODEL,
    label: 'OpenAI',
    models: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-5-mini'],
  },
  openrouter: {
    apiBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    label: 'OpenRouter',
    models: [
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-8b-instruct',
      'qwen/qwen3-8b',
    ],
  },
  groq: {
    apiBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.1-8b-instant',
    label: 'Groq',
    models: ['llama-3.1-8b-instant', 'openai/gpt-oss-20b'],
  },
  deepseek: {
    apiBaseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-v4-flash',
    label: 'DeepSeek',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  },
}

export const providerIds = Object.keys(providers) as ApiProvider[]

const isApiProvider = (value: unknown): value is ApiProvider =>
  typeof value === 'string' && providerIds.includes(value as ApiProvider)

export type OpenAiApiConfig = {
  model: string
  provider: ApiProvider
}

const defaultConfig: OpenAiApiConfig = {
  model: DEFAULT_MODEL,
  provider: 'openai',
}

export const getProvider = (provider: ApiProvider): ApiProviderConfig =>
  providers[provider]

export const getModels = (provider: ApiProvider): string[] =>
  getProvider(provider).models

export const getChatCompletionsEndpoint = (provider: ApiProvider): string =>
  new URL('chat/completions', `${getProvider(provider).apiBaseUrl}/`).toString()

export const getPermissionOrigin = (provider: ApiProvider): string => {
  const url = new URL(getProvider(provider).apiBaseUrl)
  return `${url.protocol}//${url.hostname}/*`
}

export const requestPermission = async (
  provider: ApiProvider
): Promise<boolean> => {
  if (provider === 'openai') {
    return true
  }

  return browser.permissions.request({ origins: [getPermissionOrigin(provider)] })
}

export const hasPermission = async (provider: ApiProvider): Promise<boolean> => {
  if (provider === 'openai') {
    return true
  }

  return browser.permissions.contains({ origins: [getPermissionOrigin(provider)] })
}

export const removePermission = async (
  provider: ApiProvider
): Promise<boolean> => {
  if (provider === 'openai') {
    return false
  }

  return browser.permissions.remove({ origins: [getPermissionOrigin(provider)] })
}

const get = async (): Promise<OpenAiApiConfig> => {
  const config = await storage.getItem<OpenAiApiConfig>(namespace, {
    fallback: defaultConfig,
  })

  return isApiProvider(config.provider) && typeof config.model === 'string'
    ? config
    : defaultConfig
}

const save = async (value: OpenAiApiConfig) => {
  await storage.setItem<OpenAiApiConfig>(namespace, value)
  return value
}

export default {
  defaultConfig,
  get,
  save,
  providerIds,
  getProvider,
  getModels,
  getChatCompletionsEndpoint,
  getPermissionOrigin,
  requestPermission,
  hasPermission,
  removePermission,
}