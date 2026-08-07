import { storage } from '#imports'
import {
  ConnectionMode,
  ProviderId,
  defaultProvider,
  findProvider,
  gateway,
  providers,
} from './aiCatalog'

const namespace = 'sync:__AI_SETTINGS'
const legacyNamespace = 'sync:__OPENAI_API_KEY'

/** The model the OpenAI-only build hardcoded, kept for migrated installs. */
const legacyModel = 'gpt-4o-mini'

export type AiSettings = {
  mode: ConnectionMode
  provider: ProviderId
  model: string
  apiKey: string
  gatewayModel: string
  gatewayApiKey: string
}

/** The stored record exists but does not match the current shape. */
export class InvalidAiSettingsError extends Error {
  constructor() {
    super('Stored AI settings are not readable')
    this.name = 'InvalidAiSettingsError'
  }
}

const getDefaultSettings = (): AiSettings => ({
  mode: 'direct',
  provider: defaultProvider.id,
  model: defaultProvider.defaultModel,
  apiKey: '',
  gatewayModel: '',
  gatewayApiKey: '',
})

const isAiSettings = (value: unknown): value is AiSettings => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<keyof AiSettings, unknown>

  return (
    (candidate.mode === 'direct' || candidate.mode === 'gateway') &&
    providers.some((provider) => provider.id === candidate.provider) &&
    typeof candidate.model === 'string' &&
    typeof candidate.apiKey === 'string' &&
    typeof candidate.gatewayModel === 'string' &&
    typeof candidate.gatewayApiKey === 'string'
  )
}

const migrateLegacyKey = async (): Promise<AiSettings> => {
  const legacyApiKey = (
    (await storage.getItem<string>(legacyNamespace)) ?? ''
  ).trim()

  if (!legacyApiKey) {
    return getDefaultSettings()
  }

  const migrated: AiSettings = {
    ...getDefaultSettings(),
    provider: 'openai',
    model: legacyModel,
    apiKey: legacyApiKey,
  }

  await storage.setItem<AiSettings>(namespace, migrated)
  // Only after the new record is durable, so an interrupted migration leaves
  // the key readable from one namespace or the other, never neither.
  await storage.removeItem(legacyNamespace)

  return migrated
}

/** @throws {InvalidAiSettingsError} when a stored record fails validation. */
const get = async (): Promise<AiSettings> => {
  const stored = await storage.getItem<unknown>(namespace)

  if (stored == null) {
    return migrateLegacyKey()
  }

  if (!isAiSettings(stored)) {
    throw new InvalidAiSettingsError()
  }

  return stored
}

const save = async (value: AiSettings) => {
  await storage.setItem<AiSettings>(namespace, value)
  return value
}

const addEventListener = (
  callback: (newValue: AiSettings | null, oldValue: AiSettings | null) => void
) => storage.watch<AiSettings>(namespace, callback)

const getApiKey = (settings: AiSettings) =>
  settings.mode === 'gateway' ? settings.gatewayApiKey : settings.apiKey

const getModel = (settings: AiSettings) =>
  settings.mode === 'gateway' ? settings.gatewayModel : settings.model

const getHostPermission = (settings: AiSettings) =>
  settings.mode === 'gateway'
    ? gateway.hostPermission
    : (findProvider(settings.provider) ?? defaultProvider).hostPermission

export default {
  get,
  save,
  addEventListener,
  getApiKey,
  getModel,
  getHostPermission,
  getDefaultSettings,
}
