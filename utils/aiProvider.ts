export enum AiProvider {
  OpenAI = 'openai',
  Claude = 'claude',
  Gemini = 'gemini',
}

export const aiProviderOptions: Record<
  AiProvider,
  {
    label: string
    apiKeyLabel: string
    apiKeyPlaceholder: string
    apiKeyUrl: string
    helpText: string
  }
> = {
  [AiProvider.OpenAI]: {
    label: 'OpenAI (ChatGPT)',
    apiKeyLabel: 'OpenAI API key',
    apiKeyPlaceholder: 'sk-...',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Cover letters are generated with your own OpenAI account.',
  },
  [AiProvider.Claude]: {
    label: 'Anthropic (Claude)',
    apiKeyLabel: 'Anthropic API key',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    helpText: 'Cover letters are generated with your own Anthropic account.',
  },
  [AiProvider.Gemini]: {
    label: 'Google (Gemini)',
    apiKeyLabel: 'Gemini API key',
    apiKeyPlaceholder: 'AIza...',
    apiKeyUrl: 'https://aistudio.google.com/apikey',
    helpText:
      'Cover letters are generated with your own Google account. Google AI Studio offers a free tier for Gemini.',
  },
}

export default { AiProvider, aiProviderOptions }
