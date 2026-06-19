import promptStorage, { PromptVariable } from '@/utils/prompt'
import { Button, Stack, TextField } from '@mui/material'
import { useRef } from 'react'

const PromptForm = (props: {
  prompt: string
  disabled: boolean
  onPromptChange: (prompt: string) => void
  jobTitle?: string
  jobDescription?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getPromptVariableValue = (variable: PromptVariable) => {
    switch (variable) {
      case PromptVariable.TITLE:
        return props.jobTitle ?? variable
      case PromptVariable.JOB_DESCRIPTION:
        return props.jobDescription ?? variable
      default:
        return variable
    }
  }

  const onVariableInsert = (variable: PromptVariable) => {
    const textarea = textareaRef.current
    const variableValue = getPromptVariableValue(variable)

    if (!textarea) return

    const currentPosition = textarea.selectionStart

    props.onPromptChange(
      props.prompt.slice(0, currentPosition) +
        variableValue +
        props.prompt.slice(currentPosition)
    )

    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        const newPosition = currentPosition + variableValue.length
        textarea.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onVariableInsert(PromptVariable.TITLE)}
        >
          Job title
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onVariableInsert(PromptVariable.JOB_DESCRIPTION)}
        >
          Job description
        </Button>
      </Stack>

      <TextField
        fullWidth
        multiline
        minRows={5}
        maxRows={20}
        sx={{ mt: 2 }}
        value={props.prompt}
        inputRef={textareaRef}
        disabled={props.disabled}
        placeholder={promptStorage.defaultPrompt}
        onChange={(e) => props.onPromptChange(e.target.value)}
      />
    </>
  )
}

export default PromptForm
