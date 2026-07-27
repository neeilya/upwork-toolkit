import PromptForm from '@/components/PromptForm'
import useMediaQuery from '@/hooks/useMediaQuery'
import coverLetterStorage from '@/utils/coverLetter'
import errors from '@/utils/errors'
import openAiApiConfigStorage, {
  ApiProvider,
  OpenAiApiConfig,
  providerIds,
} from '@/utils/openAiApiConfig'
import openAiApiSettingsStorage from '@/utils/openAiApiSettings'
import promptStorage from '@/utils/prompt'
import { captureException } from '@/utils/sentry'
import { helperKey } from '@/utils/system'
import { OpenInNew, Save, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

const OPENAI_API_KEYS_URL = 'https://platform.openai.com/api-keys'

const MAX_TEXT_SIZE = 8000
const CUSTOM_MODEL = '__custom_model__'

const getApiKeyLabel = (provider: ApiProvider) =>
  `${openAiApiConfigStorage.getProvider(provider).label} API key`

const getApiKeyPlaceholder = (provider: ApiProvider) => {
  if (provider === 'groq') return 'gsk_...'
  if (provider === 'openrouter') return 'sk-or-v1-...'

  return 'sk-...'
}

const ApiKeyInfoAlert = (props: { provider: ApiProvider }) => {
  if (props.provider !== 'openai') {
    const provider = openAiApiConfigStorage.getProvider(props.provider)

    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>
          Connect your API key to start generating cover letters
        </AlertTitle>
        Get an API key from {provider.label} and paste it below.
      </Alert>
    )
  }

  return (
    <Alert severity="info" sx={{ mt: 2 }}>
      <AlertTitle>
        Connect your OpenAI API key to start generating cover letters
      </AlertTitle>
      You can now apply to jobs with custom-tailored AI generated cover letters
      - just add your OpenAI-compatible API key by clicking the button below.
      <br />
      Create a key at{' '}
      <Link href={OPENAI_API_KEYS_URL} target="_blank" rel="noopener">
        <strong>platform.openai.com/api-keys</strong>
        <OpenInNew sx={{ verticalAlign: 'middle', fontSize: '100%' }} />
      </Link>{' '}
      and paste it below.
    </Alert>
  )
}

/** Shows the first and last few characters, masking the rest. */
const maskApiKey = (key: string) => {
  const trimmed = key.trim()

  if (trimmed.length <= 7) {
    return '•'.repeat(trimmed.length)
  }

  return `${trimmed.slice(0, 3)}${'•'.repeat(8)}${trimmed.slice(-4)}`
}

const AiProviderFields = (props: {
  apiConfig: OpenAiApiConfig
  disabled: boolean
  onConfigChange: (config: OpenAiApiConfig) => void
  onProviderChange: (provider: ApiProvider) => void
}) => {
  const selectedProvider = openAiApiConfigStorage.getProvider(
    props.apiConfig.provider
  )
  const supportedModels = openAiApiConfigStorage.getModels(
    props.apiConfig.provider
  )
  const isCustomModel = !supportedModels.includes(props.apiConfig.model)

  return (
    <>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="ai-provider-label">Provider</InputLabel>
        <Select
          labelId="ai-provider-label"
          label="Provider"
          value={props.apiConfig.provider}
          onChange={(event) =>
            props.onProviderChange(event.target.value as ApiProvider)
          }
          disabled={props.disabled}
        >
          {providerIds.map((provider) => (
            <MenuItem key={provider} value={provider}>
              {openAiApiConfigStorage.getProvider(provider).label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        select
        fullWidth
        sx={{ mt: 2 }}
        label="Model"
        value={isCustomModel ? CUSTOM_MODEL : props.apiConfig.model}
        onChange={(event) => {
          const model = event.target.value

          props.onConfigChange({
            ...props.apiConfig,
            model: model === CUSTOM_MODEL ? '' : model,
          })
        }}
        disabled={props.disabled}
        helperText={`Select a preset or enter a model ID supported by ${selectedProvider.label}`}
      >
        {supportedModels.map((model: string) => (
          <MenuItem key={model} value={model}>
            {model}
          </MenuItem>
        ))}
        <MenuItem value={CUSTOM_MODEL}>Custom model ID</MenuItem>
      </TextField>

      {isCustomModel && (
        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Custom model ID"
          value={props.apiConfig.model}
          onChange={(event) =>
            props.onConfigChange({
              ...props.apiConfig,
              model: event.target.value,
            })
          }
          disabled={props.disabled}
          helperText={`Enter a model ID supported by ${selectedProvider.label}`}
        />
      )}
    </>
  )
}

const CoverLetter = () => {
  const { isMobile } = useMediaQuery()
  const { enqueueSnackbar } = useSnackbar()

  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState(promptStorage.defaultPrompt)
  const [apiKey, setApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')
  const [apiConfig, setApiConfig] = useState<OpenAiApiConfig>(
    openAiApiConfigStorage.defaultConfig
  )
  const [savedApiConfig, setSavedApiConfig] = useState<OpenAiApiConfig>(
    openAiApiConfigStorage.defaultConfig
  )
  const [showApiKey, setShowApiKey] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [savingCoverLetter, setSavingCoverLetter] = useState(false)
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  // Gating reflects the persisted key, not the in-progress input value.
  const hasApiKey = savedApiKey.trim().length > 0
  const showKeyForm = !hasApiKey || editingApiKey
  const apiKeyLabel = getApiKeyLabel(apiConfig.provider)
  const apiKeyPlaceholder = getApiKeyPlaceholder(apiConfig.provider)

  const onEditApiKey = () => {
    setApiKey(savedApiKey)
    setEditingApiKey(true)
  }

  const onCancelEditApiKey = () => {
    setApiKey(savedApiKey)
    setApiConfig(savedApiConfig)
    setShowApiKey(false)
    setEditingApiKey(false)
  }

  const onProviderChange = (provider: ApiProvider) => {
    setApiConfig({
      provider,
      model: openAiApiConfigStorage.getProvider(provider).defaultModel,
    })
    setApiKey('')
  }

  const makeSaveHandler =
    (setSaving: (saving: boolean) => void, save: () => Promise<unknown>) =>
    async () => {
      setSaving(true)

      try {
        await save()
        enqueueSnackbar('Your changes have been saved', { variant: 'success' })
      } catch (error) {
        captureException(error)
        enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
      } finally {
        setSaving(false)
      }
    }

  const onSaveApiKey = makeSaveHandler(setSavingApiKey, async () => {
    const model = apiConfig.model.trim()
    if (!model) {
      throw new Error('Enter a model name')
    }

    const nextConfig = { provider: apiConfig.provider, model }
    const permissionGranted = await openAiApiConfigStorage.requestPermission(
      nextConfig.provider
    )

    if (!permissionGranted) {
      throw new Error('Permission was not granted for this AI provider')
    }

    const providerChanged = savedApiConfig.provider !== nextConfig.provider
    const savedSettings = await openAiApiSettingsStorage.save({
      apiKey: apiKey.trim(),
      config: nextConfig,
    })
    const savedKey = savedSettings.apiKey

    setApiKey(savedKey)
    setSavedApiKey(savedKey)
    setApiConfig(nextConfig)
    setSavedApiConfig(nextConfig)

    if (providerChanged) {
      try {
        await openAiApiConfigStorage.removePermission(savedApiConfig.provider)
      } catch (error) {
        captureException(error)
      }
    }
  })

  const onSaveCoverLetter = makeSaveHandler(setSavingCoverLetter, () =>
    coverLetterStorage.save(text)
  )

  const onSavePrompt = makeSaveHandler(setSavingPrompt, () =>
    promptStorage.save(prompt)
  )

  useEffect(() => {
    const init = async () => {
      const [prompt, text, apiSettings] = await Promise.all([
        promptStorage.get(),
        coverLetterStorage.get(),
        openAiApiSettingsStorage.get(),
      ])

      setPrompt(prompt)
      setText(text)
      setApiKey(apiSettings.apiKey)
      setSavedApiKey(apiSettings.apiKey)
      setApiConfig(apiSettings.config)
      setSavedApiConfig(apiSettings.config)

      setInitialized(true)
    }

    init()
  }, [])

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" component="h6">
        Use ChatGPT to apply faster with personalized cover letters
      </Typography>

      {showKeyForm ? (
        <>
          {!hasApiKey && <ApiKeyInfoAlert provider={apiConfig.provider} />}

          <AiProviderFields
            apiConfig={apiConfig}
            disabled={savingApiKey || !initialized}
            onConfigChange={setApiConfig}
            onProviderChange={onProviderChange}
          />

          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label={apiKeyLabel}
            placeholder={apiKeyPlaceholder}
            value={apiKey}
            type={showApiKey ? 'text' : 'password'}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={savingApiKey || !initialized}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              },
            }}
          />

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            {hasApiKey && (
              <Button
                color="inherit"
                sx={{ mr: 1 }}
                onClick={onCancelEditApiKey}
                disabled={savingApiKey}
              >
                Cancel
              </Button>
            )}

            <Button
              color="primary"
              endIcon={<Save />}
              variant="contained"
              fullWidth={isMobile}
              onClick={onSaveApiKey}
              disabled={savingApiKey || !initialized || !apiKey.trim()}
            >
              Save
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            disabled
            label={apiKeyLabel}
            value={maskApiKey(savedApiKey)}
          />

          <Button color="primary" variant="outlined" onClick={onEditApiKey}>
            Edit
          </Button>
        </Box>
      )}

      {hasApiKey && (
        <>
          <Typography sx={{ mt: 2 }}>
            Create a detailed prompt below and next time you're on a job
            proposal page click "Generate" button under the cover letter input
            (you can also use "{helperKey} + Enter" as a shortcut) and let AI
            generate a unique cover letter.
            <br />
            <br />
            You can also edit the prompt for each job separately when you apply.
            <br />
            Insert job title & description variables into the prompt using
            buttons below.
          </Typography>

          <PromptForm
            prompt={prompt}
            disabled={savingPrompt}
            onPromptChange={setPrompt}
          />

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              color="primary"
              endIcon={<Save />}
              variant="contained"
              fullWidth={isMobile}
              onClick={onSavePrompt}
              disabled={savingPrompt || !initialized}
            >
              Save
            </Button>
          </Box>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h6">
        Apply faster with prefilled cover letter
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Create a template below and next time you land on a job proposal page,
        cover letter will be prepopulated with whatever you save here.
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={5}
        maxRows={20}
        value={text}
        sx={{ mt: 2 }}
        onChange={(e) => setText(e.target.value)}
        disabled={savingCoverLetter || !initialized}
        slotProps={{ htmlInput: { maxLength: MAX_TEXT_SIZE } }}
      />

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          color="primary"
          onClick={onSaveCoverLetter}
          endIcon={<Save />}
          variant="contained"
          fullWidth={isMobile}
          disabled={savingCoverLetter || !initialized}
        >
          Save
        </Button>
      </Box>
    </Box>
  )
}

export default CoverLetter
