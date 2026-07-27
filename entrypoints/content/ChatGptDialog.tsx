import { browser } from '#imports'
import PromptForm from '@/components/PromptForm'
import Storage, { StorageInterface } from '@/contexts/storage'
import useKeyPress from '@/hooks/useKeyPress'
import runtime, { GenerateCoverLetterResponse } from '@/utils/runtime'
import { helperKey } from '@/utils/system'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'

const getGenerationErrorMessage = (
  error: Extract<GenerateCoverLetterResponse, { type: 'error' }>['error']
) => {
  switch (error) {
    case 'NO_API_KEY':
      return 'Add an API key in the extension’s Cover letter settings to generate cover letters.'
    case 'API_PROVIDER_PERMISSION_REQUIRED':
      return 'Grant access to your selected AI provider in the extension’s Cover letter settings.'
    case 'ACCESS_DENIED':
      return 'Your selected AI provider denied access. Check your account permissions and API key.'
    case 'INVALID_API_KEY':
      return 'Your API key was rejected. Check the key for your selected AI provider.'
    case 'INSUFFICIENT_CREDITS':
      return 'Your selected AI provider account has insufficient credit to generate a cover letter.'
    case 'MODEL_UNAVAILABLE':
      return 'This model is unavailable from your selected AI provider. Select another model and try again.'
    case 'NETWORK_ERROR':
      return 'Could not reach your selected AI provider. Check your connection and try again.'
    case 'RATE_LIMITED':
      return 'Your selected AI provider is rate-limiting requests. Wait a moment and try again.'
    case 'GENERATION_FAILED':
      return 'Cover letter generation failed. Please try again.'
    default:
      error satisfies never
      return 'Cover letter generation failed. Please try again.'
  }
}

const ChatGptDialog = (props: {
  onClose: () => void
  jobTitle: string
  jobDescription: string
  onInsert: (template: string) => void
}) => {
  const storage = useContext<StorageInterface>(Storage)

  const [template, setTemplate] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(() =>
    storage.prompt
      .replace('#{title}', `<title>${props.jobTitle}</title>`)
      .replace(
        '#{job_description}',
        `<job_description>${props.jobDescription}</job_description>`
      )
  )
  const [mode, setMode] = useState<'writingPrompt' | 'generating'>(
    'writingPrompt'
  )

  const portRef = useRef<ReturnType<typeof browser.runtime.connect> | null>(
    null
  )

  // Disconnecting cancels the in-flight generation in the background worker.
  useEffect(
    () => () => {
      portRef.current?.disconnect()
      portRef.current = null
    },
    []
  )

  const onGenerate = () => {
    // Supersede any in-flight generation. Nulling the ref first makes the old
    // port's listeners no-op via the identity guard below.
    portRef.current?.disconnect()
    portRef.current = null

    setError(null)
    setTemplate('')
    setMode('generating')
    setStreaming(true)

    const port = browser.runtime.connect({
      name: runtime.Message.GENERATE_COVER_LETTER,
    })
    portRef.current = port

    const finish = () => {
      portRef.current = null
      port.disconnect()
    }

    port.onMessage.addListener((response: GenerateCoverLetterResponse) => {
      // Ignore messages from a superseded or already-finished generation.
      if (portRef.current !== port) {
        return
      }

      if (response.type === 'chunk') {
        setTemplate((prev) => prev + response.content)
        return
      }

      if (response.type === 'done') {
        setStreaming(false)
        finish()
        return
      }

      if (response.type === 'error') {
        setStreaming(false)
        setMode('writingPrompt')
        setError(getGenerationErrorMessage(response.error))
        finish()
      }
    })

    port.onDisconnect.addListener(() => {
      // Only react to an unexpected drop for the current generation; intentional
      // disconnects null the ref first, so this is a no-op for them.
      if (portRef.current !== port) {
        return
      }

      setStreaming(false)
      setMode('writingPrompt')
      setError('Cover letter generation was interrupted. Please try again.')
      portRef.current = null
    })

    port.postMessage({
      prompt,
      type: runtime.Message.GENERATE_COVER_LETTER,
    })
  }

  useKeyPress({
    key: 'Enter',
    ctrlKey: true,
    onKeyPress: () => {
      if (mode === 'writingPrompt') {
        onGenerate()
      }

      if (mode === 'generating' && !streaming) {
        props.onInsert(template)
      }
    },
  })

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      scroll="paper"
      onClose={props.onClose}
      slotProps={{
        paper: {
          sx: {
            height: 'auto',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <DialogTitle>Generate cover letter</DialogTitle>

      <DialogContent sx={{ pb: 1.5 }}>
        <Typography sx={{ mb: 2 }}>
          Insert job title & description variables into the prompt using buttons
          below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mode === 'writingPrompt' && (
          <PromptForm
            prompt={prompt}
            disabled={false}
            jobTitle={props.jobTitle}
            jobDescription={props.jobDescription}
            onPromptChange={setPrompt}
          />
        )}

        {mode === 'generating' && (
          <TextField
            fullWidth
            multiline
            minRows={10}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5 }}>
        <Button variant="outlined" onClick={props.onClose}>
          Cancel (Esc)
        </Button>

        {mode === 'writingPrompt' && (
          <Button variant="contained" onClick={onGenerate}>
            Generate ({helperKey} + Enter)
          </Button>
        )}

        {mode === 'generating' && (
          <Button
            variant="contained"
            loading={streaming}
            onClick={() => props.onInsert(template)}
          >
            Insert ({helperKey} + Enter)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ChatGptDialog
