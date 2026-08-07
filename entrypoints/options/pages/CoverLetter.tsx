import { browser } from '#imports'
import aiApi from '@/api/ai'
import PromptForm from '@/components/PromptForm'
import useMediaQuery from '@/hooks/useMediaQuery'
import {
  ConnectionMode,
  ModelPreset,
  ProviderDefinition,
  ProviderId,
  defaultProvider,
  findProvider,
  gateway,
  providers,
} from '@/utils/aiCatalog'
import aiSettingsStorage, { AiSettings } from '@/utils/aiSettings'
import coverLetterStorage from '@/utils/coverLetter'
import errors from '@/utils/errors'
import promptStorage from '@/utils/prompt'
import { AiErrorCode } from '@/utils/runtime'
import { captureException } from '@/utils/sentry'
import { helperKey } from '@/utils/system'
import {
  Cloud,
  Key,
  OpenInNew,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

const MAX_TEXT_SIZE = 8000

/** Sentinel value for the "type your own model id" option in the model select. */
const CUSTOM_MODEL = '__custom__'

const modelDiscoveryErrors: Record<AiErrorCode, string> = {
  INVALID_API_KEY: 'The AI Gateway rejected this key.',
  INSUFFICIENT_QUOTA: 'This AI Gateway account has run out of credit.',
  RATE_LIMITED: 'The AI Gateway is rate limiting requests. Try again shortly.',
  MODEL_UNAVAILABLE: 'The AI Gateway could not list models for this key.',
  GENERATION_FAILED: 'Could not load models from the AI Gateway.',
}

const permissionFailure = 'The browser refused the permission request.'

const originLabel = (origin: string) =>
  origin.replace(/^https:\/\//, '').replace(/\/\*?$/, '')

/** Shows the first and last few characters, masking the rest. */
const maskApiKey = (key: string) => {
  const trimmed = key.trim()

  if (trimmed.length <= 7) {
    return '•'.repeat(trimmed.length)
  }

  return `${trimmed.slice(0, 3)}${'•'.repeat(8)}${trimmed.slice(-4)}`
}

const CoverLetter = () => {
  const { isMobile } = useMediaQuery()
  const { enqueueSnackbar } = useSnackbar()

  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState(promptStorage.defaultPrompt)

  const [saved, setSaved] = useState<AiSettings | null>(null)
  const [settingsUnreadable, setSettingsUnreadable] = useState(false)

  const [mode, setMode] = useState<ConnectionMode>('direct')
  const [providerId, setProviderId] = useState<ProviderId>(defaultProvider.id)
  const [model, setModel] = useState(defaultProvider.defaultModel)
  const [apiKey, setApiKey] = useState('')
  const [usingCustomModel, setUsingCustomModel] = useState(false)

  const [gatewayModels, setGatewayModels] = useState<ModelPreset[] | null>(null)
  const [loadingGatewayModels, setLoadingGatewayModels] = useState(false)
  const [gatewayModelsError, setGatewayModelsError] = useState<string | null>(
    null
  )
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const [showApiKey, setShowApiKey] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [savingCoverLetter, setSavingCoverLetter] = useState(false)
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [savingConnection, setSavingConnection] = useState(false)

  const provider: ProviderDefinition =
    findProvider(providerId) ?? defaultProvider
  const isGateway = mode === 'gateway'

  // Gating reflects the persisted connection, not the in-progress input value.
  const savedApiKey = saved ? aiSettingsStorage.getApiKey(saved) : ''
  const savedModel = saved ? aiSettingsStorage.getModel(saved) : ''
  const isConnected = savedApiKey.trim().length > 0
  const showKeyForm = !isConnected || editingApiKey

  const presetModels: ModelPreset[] = isGateway
    ? (gatewayModels ?? [])
    : provider.models

  // Keep the selected model listed even when the gateway stops offering it, so
  // the field never renders blank against a value the user did save.
  const modelOptions: ModelPreset[] =
    usingCustomModel || !model || presetModels.some(({ id }) => id === model)
      ? presetModels
      : [...presetModels, { id: model, label: model }]

  const applySettings = (settings: AiSettings) => {
    setMode(settings.mode)
    setProviderId(settings.provider)
    setApiKey(aiSettingsStorage.getApiKey(settings))

    const activeModel = aiSettingsStorage.getModel(settings)
    setModel(activeModel)

    const presets =
      settings.mode === 'gateway'
        ? activeModel
          ? [activeModel]
          : []
        : (findProvider(settings.provider) ?? defaultProvider).models.map(
            (preset) => preset.id
          )

    setUsingCustomModel(
      activeModel.length > 0 && !presets.includes(activeModel)
    )
  }

  const onModeChange = (next: ConnectionMode | null) => {
    if (!next || next === mode) return

    setMode(next)
    setPermissionError(null)
    setGatewayModelsError(null)
    setUsingCustomModel(false)

    if (next === 'gateway') {
      setApiKey(saved?.gatewayApiKey ?? '')
      setModel(saved?.gatewayModel ?? '')
      return
    }

    setApiKey(saved?.apiKey ?? '')
    setModel(saved?.model ?? defaultProvider.defaultModel)
  }

  const onProviderChange = (next: ProviderId) => {
    setProviderId(next)
    setPermissionError(null)
    setUsingCustomModel(false)
    setModel((findProvider(next) ?? defaultProvider).defaultModel)
  }

  const onModelSelect = (value: string) => {
    if (value === CUSTOM_MODEL) {
      setUsingCustomModel(true)
      return
    }

    setUsingCustomModel(false)
    setModel(value)
  }

  const onEditApiKey = () => {
    setApiKey(savedApiKey)
    setEditingApiKey(true)
  }

  const onCancelEditApiKey = () => {
    if (saved) applySettings(saved)
    setShowApiKey(false)
    setEditingApiKey(false)
    setPermissionError(null)
  }

  const hostPermission = isGateway
    ? gateway.hostPermission
    : provider.hostPermission

  const onLoadGatewayModels = () => {
    setGatewayModelsError(null)
    setLoadingGatewayModels(true)

    // Chrome only honours permissions.request() inside the click's own task, so
    // nothing may be awaited before it.
    browser.permissions
      .request({ origins: [gateway.hostPermission] })
      .then(async (granted) => {
        if (!granted) {
          setGatewayModelsError(
            'Loading the model list needs access to ai-gateway.vercel.sh.'
          )
          return
        }

        try {
          setGatewayModels(await aiApi.fetchGatewayModels(apiKey.trim()))
        } catch (error) {
          const failure = aiApi.classifyError(error)

          if (failure.reportable) {
            captureException(error, { data: failure.diagnostics })
          }

          setGatewayModelsError(modelDiscoveryErrors[failure.code])
        }
      })
      .catch((error) => {
        captureException(error)
        setGatewayModelsError(permissionFailure)
      })
      .finally(() => setLoadingGatewayModels(false))
  }

  const persistConnection = async () => {
    const trimmedKey = apiKey.trim()
    const trimmedModel = model.trim()
    const previous = saved ?? aiSettingsStorage.getDefaultSettings()

    const next: AiSettings = isGateway
      ? {
          ...previous,
          mode,
          gatewayApiKey: trimmedKey,
          gatewayModel: trimmedModel,
        }
      : {
          ...previous,
          mode,
          provider: providerId,
          apiKey: trimmedKey,
          model: trimmedModel,
        }

    setSaved(await aiSettingsStorage.save(next))
    setSettingsUnreadable(false)
    setEditingApiKey(false)
    setShowApiKey(false)
  }

  const onSaveConnection = () => {
    setPermissionError(null)
    setSavingConnection(true)

    // Same user-gesture constraint as onLoadGatewayModels.
    browser.permissions
      .request({ origins: [hostPermission] })
      .then(async (granted) => {
        if (!granted) {
          setPermissionError(
            `Nothing was saved: cover letters can only be generated once the extension is allowed to reach ${originLabel(hostPermission)}.`
          )
          return
        }

        try {
          await persistConnection()
          enqueueSnackbar('Your changes have been saved', {
            variant: 'success',
          })
        } catch (error) {
          captureException(error)
          enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
        }
      })
      .catch((error) => {
        captureException(error)
        setPermissionError(permissionFailure)
      })
      .finally(() => setSavingConnection(false))
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

  const onSaveCoverLetter = makeSaveHandler(setSavingCoverLetter, () =>
    coverLetterStorage.save(text)
  )

  const onSavePrompt = makeSaveHandler(setSavingPrompt, () =>
    promptStorage.save(prompt)
  )

  useEffect(() => {
    const init = async () => {
      const [prompt, text] = await Promise.all([
        promptStorage.get(),
        coverLetterStorage.get(),
      ])

      setPrompt(prompt)
      setText(text)

      try {
        const settings = await aiSettingsStorage.get()
        setSaved(settings)
        applySettings(settings)
      } catch (error) {
        // A record that exists but cannot be parsed is a bug, not a fresh
        // install — never silently fall back to the pre-migration key.
        captureException(error)
        setSettingsUnreadable(true)
      }

      setInitialized(true)
    }

    init()
  }, [])

  const modelSelectValue = usingCustomModel ? CUSTOM_MODEL : model
  const canSaveConnection =
    initialized &&
    !savingConnection &&
    apiKey.trim().length > 0 &&
    model.trim().length > 0

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" component="h6">
        Generate personalized cover letters with your own AI account
      </Typography>

      {settingsUnreadable && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Your saved AI settings could not be read</AlertTitle>
          Pick a provider and re-enter your API key below to restore cover
          letter generation.
        </Alert>
      )}

      {showKeyForm ? (
        <>
          {!isConnected && !settingsUnreadable && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>
                Connect an AI provider to start generating cover letters
              </AlertTitle>
              Cover letters are generated with your own account — the extension
              has no backend and your key never leaves this browser.
            </Alert>
          )}

          <ToggleButtonGroup
            exclusive
            size="small"
            sx={{ mt: 2 }}
            value={mode}
            onChange={(_, value) => onModeChange(value)}
          >
            <ToggleButton value="direct">
              <Key sx={{ mr: 1, fontSize: '120%' }} />
              Direct provider
            </ToggleButton>
            <ToggleButton value="gateway">
              <Cloud sx={{ mr: 1, fontSize: '120%' }} />
              AI Gateway
            </ToggleButton>
          </ToggleButtonGroup>

          {isGateway ? (
            <Typography sx={{ mt: 2 }}>
              One Vercel AI Gateway key gives you every model it routes to. See{' '}
              <Link href={gateway.docsUrl} target="_blank" rel="noopener">
                <strong>{gateway.docsLabel}</strong>
                <OpenInNew sx={{ verticalAlign: 'middle', fontSize: '100%' }} />
              </Link>{' '}
              to create one, paste it below, then load the model list.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              sx={{ mt: 2 }}
              label="Provider"
              value={providerId}
              disabled={savingConnection || !initialized}
              onChange={(e) => onProviderChange(e.target.value as ProviderId)}
            >
              {providers.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label={
              isGateway ? 'AI Gateway API key' : `${provider.label} API key`
            }
            placeholder={
              isGateway ? gateway.apiKeyPlaceholder : provider.apiKeyPlaceholder
            }
            value={apiKey}
            type={showApiKey ? 'text' : 'password'}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={savingConnection || !initialized}
            helperText={
              isGateway ? undefined : (
                <>
                  Create a key at{' '}
                  <Link
                    href={provider.apiKeysUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    {provider.apiKeysLabel}
                    <OpenInNew
                      sx={{ verticalAlign: 'middle', fontSize: '100%' }}
                    />
                  </Link>
                </>
              )
            }
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

          {isGateway && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                loading={loadingGatewayModels}
                disabled={!apiKey.trim() || !initialized}
                onClick={onLoadGatewayModels}
              >
                Load available models
              </Button>
            </Box>
          )}

          {gatewayModelsError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {gatewayModelsError}
            </Alert>
          )}

          <TextField
            select
            fullWidth
            sx={{ mt: 2 }}
            label="Model"
            value={modelSelectValue}
            disabled={savingConnection || !initialized}
            onChange={(e) => onModelSelect(e.target.value)}
            helperText={
              isGateway && !gatewayModels
                ? 'Load the model list to browse everything your gateway key can reach, or enter a model id yourself.'
                : undefined
            }
          >
            {modelOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
            <MenuItem value={CUSTOM_MODEL}>Other (enter a model id)</MenuItem>
          </TextField>

          {usingCustomModel && (
            <TextField
              fullWidth
              sx={{ mt: 2 }}
              label="Model id"
              placeholder={
                isGateway ? 'openai/gpt-5.6-luna' : provider.defaultModel
              }
              value={model}
              disabled={savingConnection || !initialized}
              onChange={(e) => setModel(e.target.value)}
            />
          )}

          {permissionError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {permissionError}
            </Alert>
          )}

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            {isConnected && (
              <Button
                color="inherit"
                sx={{ mr: 1 }}
                onClick={onCancelEditApiKey}
                disabled={savingConnection}
              >
                Cancel
              </Button>
            )}

            <Button
              color="primary"
              endIcon={<Save />}
              variant="contained"
              fullWidth={isMobile}
              onClick={onSaveConnection}
              disabled={!canSaveConnection}
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
            label={
              isGateway ? 'AI Gateway API key' : `${provider.label} API key`
            }
            value={maskApiKey(savedApiKey)}
            helperText={`Model: ${savedModel}`}
          />

          <Button color="primary" variant="outlined" onClick={onEditApiKey}>
            Edit
          </Button>
        </Box>
      )}

      {isConnected && (
        <>
          <Typography sx={{ mt: 2 }}>
            Create a detailed prompt below and next time you're on a job
            proposal page click "Generate" button under the cover letter input
            (you can also use "{helperKey} + Enter" as a shortcut) and let your
            AI provider generate a unique cover letter.
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
