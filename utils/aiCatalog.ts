export type ConnectionMode = 'direct' | 'gateway'

export type ProviderId =
  | 'openai'
  | 'google'
  | 'anthropic'
  | 'groq'
  | 'deepseek'
  | 'openrouter'

export type ModelPreset = {
  id: string
  label: string
}

type ProviderBase = {
  id: ProviderId
  label: string
  hostPermission: string
  apiKeysUrl: string
  apiKeysLabel: string
  apiKeyPlaceholder: string
  defaultModel: string
  models: ModelPreset[]
}

export type ProviderDefinition = ProviderBase &
  (
    | { kind: 'openai' | 'google' | 'anthropic' }
    | { kind: 'openai-compatible'; baseUrl: string }
  )

/**
 * Model ids were checked against each vendor's deprecation page on 2026-08-07.
 * Groq's `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` are omitted
 * deliberately — both shut down 2026-08-16.
 */
export const providers: ProviderDefinition[] = [
  {
    id: 'openai',
    kind: 'openai',
    label: 'OpenAI',
    // Narrower than the `/*` pattern used below because it must match the
    // already-granted manifest entry; broadening it would re-prompt every
    // installed user.
    hostPermission: 'https://api.openai.com/',
    apiKeysUrl: 'https://platform.openai.com/api-keys',
    apiKeysLabel: 'platform.openai.com/api-keys',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'gpt-5.6-luna',
    models: [
      { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna (fastest, cheapest)' },
      { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra (balanced)' },
      { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol (most capable)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (legacy)' },
    ],
  },
  {
    id: 'google',
    kind: 'google',
    label: 'Google Gemini',
    hostPermission: 'https://generativelanguage.googleapis.com/*',
    apiKeysUrl: 'https://aistudio.google.com/apikey',
    apiKeysLabel: 'aistudio.google.com/apikey',
    apiKeyPlaceholder: 'AIza...',
    defaultModel: 'gemini-3.6-flash',
    models: [
      { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (latest)' },
      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
      {
        id: 'gemini-3.5-flash-lite',
        label: 'Gemini 3.5 Flash Lite (cheapest)',
      },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
  },
  {
    id: 'anthropic',
    kind: 'anthropic',
    label: 'Anthropic Claude',
    hostPermission: 'https://api.anthropic.com/*',
    apiKeysUrl: 'https://console.anthropic.com/settings/keys',
    apiKeysLabel: 'console.anthropic.com/settings/keys',
    apiKeyPlaceholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
      { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (most capable)' },
    ],
  },
  {
    id: 'groq',
    kind: 'openai-compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    label: 'Groq',
    hostPermission: 'https://api.groq.com/*',
    apiKeysUrl: 'https://console.groq.com/keys',
    apiKeysLabel: 'console.groq.com/keys',
    apiKeyPlaceholder: 'gsk_...',
    defaultModel: 'openai/gpt-oss-20b',
    models: [
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (fastest)' },
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
    ],
  },
  {
    id: 'deepseek',
    kind: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    label: 'DeepSeek',
    hostPermission: 'https://api.deepseek.com/*',
    apiKeysUrl: 'https://platform.deepseek.com/api_keys',
    apiKeysLabel: 'platform.deepseek.com/api_keys',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'deepseek-v4-flash',
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
    ],
  },
  {
    id: 'openrouter',
    kind: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    label: 'OpenRouter',
    hostPermission: 'https://openrouter.ai/*',
    apiKeysUrl: 'https://openrouter.ai/keys',
    apiKeysLabel: 'openrouter.ai/keys',
    apiKeyPlaceholder: 'sk-or-v1-...',
    defaultModel: 'openai/gpt-5.6-luna',
    models: [
      { id: 'openai/gpt-5.6-luna', label: 'GPT-5.6 Luna' },
      { id: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6' },
      { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
      { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
    ],
  },
]

export const gateway = {
  hostPermission: 'https://ai-gateway.vercel.sh/*',
  docsUrl: 'https://vercel.com/docs/ai-gateway/authentication',
  docsLabel: 'vercel.com/docs/ai-gateway/authentication',
  apiKeyPlaceholder: 'vck_...',
}

export const defaultProvider = providers[0]

export const findProvider = (id: ProviderId): ProviderDefinition | undefined =>
  providers.find((provider) => provider.id === id)

/**
 * Origins already covered by the manifest's static `host_permissions`. Kept
 * static so installs that predate multi-provider support keep working without
 * granting anything.
 */
export const staticHostPermissions = [defaultProvider.hostPermission]

export const optionalHostPermissions = [
  ...providers
    .map((provider) => provider.hostPermission)
    .filter((origin) => !staticHostPermissions.includes(origin)),
  gateway.hostPermission,
]
