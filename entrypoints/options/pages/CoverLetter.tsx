import PromptForm from '@/components/PromptForm'
import Storage, { StorageInterface } from '@/contexts/storage'
import useMediaQuery from '@/hooks/useMediaQuery'
import { AiProvider, aiProviderOptions } from '@/utils/aiProvider'
import anthropicApiKeyStorage from '@/utils/anthropicApiKey'
import coverLetterStorage from '@/utils/coverLetter'
import errors from '@/utils/errors'
import geminiApiKeyStorage from '@/utils/geminiApiKey'
import openAiApiKeyStorage from '@/utils/openAiApiKey'
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
  IconButton,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'

const providerApiKeyStorage: Record<AiProvider, typeof openAiApiKeyStorage> = {
  [AiProvider.OpenAI]: openAiApiKeyStorage,
  [AiProvider.Claude]: anthropicApiKeyStorage,
  [AiProvider.Gemini]: geminiApiKeyStorage,
}

const MAX_TEXT_SIZE = 8000

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
  const storage = useContext<StorageInterface>(Storage)

  const provider = storage.globalState.aiProvider
  const providerOption = aiProviderOptions[provider]

  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState(promptStorage.defaultPrompt)
  const [apiKey, setApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [savingCoverLetter, setSavingCoverLetter] = useState(false)
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  // Gating reflects the persisted key, not the in-progress input value.
  const hasApiKey = savedApiKey.trim().length > 0
  const showKeyForm = !hasApiKey || editingApiKey

  const onProviderChange = (newProvider: AiProvider) =>
    storage.setState({ aiProvider: newProvider })

  const onEditApiKey = () => {
    setApiKey(savedApiKey)
    setEditingApiKey(true)
  }

  const onCancelEditApiKey = () => {
    setApiKey(savedApiKey)
    setShowApiKey(false)
    setEditingApiKey(false)
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
    setSavedApiKey(await providerApiKeyStorage[provider].save(apiKey.trim()))
    setEditingApiKey(false)
  })

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
      setInitialized(true)
    }

    init()
  }, [])

  // Re-load the API key whenever the selected provider changes, since each
  // provider's key lives in its own storage namespace.
  useEffect(() => {
    const loadApiKey = async () => {
      const key = await providerApiKeyStorage[provider].get()
      setApiKey(key)
      setSavedApiKey(key)
      setShowApiKey(false)
      setEditingApiKey(false)
    }

    loadApiKey()
  }, [provider])

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" component="h6">
        Use AI to apply faster with personalized cover letters
      </Typography>

      <Select
        fullWidth
        sx={{ mt: 2 }}
        value={provider}
        disabled={!initialized}
        onChange={(e) => onProviderChange(e.target.value as AiProvider)}
      >
        {Object.entries(aiProviderOptions).map(([value, option]) => (
          <MenuItem key={value} value={value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {showKeyForm ? (
        <>
          {!hasApiKey && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>
                Connect your {providerOption.apiKeyLabel} to start generating
                cover letters
              </AlertTitle>
              {providerOption.helpText}
              <br />
              Create a key at{' '}
              <Link href={providerOption.apiKeyUrl} target="_blank" rel="noopener">
                <strong>{providerOption.apiKeyUrl.replace(/^https?:\/\//, '')}</strong>
                <OpenInNew sx={{ verticalAlign: 'middle', fontSize: '100%' }} />
              </Link>{' '}
              and paste it below.
            </Alert>
          )}

          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label={providerOption.apiKeyLabel}
            placeholder={providerOption.apiKeyPlaceholder}
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
            label={providerOption.apiKeyLabel}
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
            (you can also use "{helperKey} + Enter" as a shortcut) to
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
