export type GenerationErrorCode =
  | 'ACCESS_DENIED'
  | 'INSUFFICIENT_CREDITS'
  | 'INVALID_API_KEY'
  | 'MODEL_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'GENERATION_FAILED'

class GenerationError extends Error {
  constructor(public readonly code: GenerationErrorCode) {
    super(code)
    this.name = 'GenerationError'
  }
}

const isGenerationError = (error: unknown): error is GenerationError =>
  error instanceof GenerationError

const getErrorCode = (
  status: number,
  details: string
): GenerationErrorCode => {
  switch (status) {
    case 401:
      return 'INVALID_API_KEY'
    case 403:
      return 'ACCESS_DENIED'
    case 402:
      return 'INSUFFICIENT_CREDITS'
    case 404:
      return 'MODEL_UNAVAILABLE'
    case 400:
      return /\bmodel\b/i.test(details)
        ? 'MODEL_UNAVAILABLE'
        : 'GENERATION_FAILED'
    case 429:
      return 'RATE_LIMITED'
    default:
      return 'GENERATION_FAILED'
  }
}

const handleStreamLine = (
  line: string,
  onChunk: (chunk: string) => void
): boolean => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return false

  const data = trimmed.slice('data:'.length).trim()
  if (data === '[DONE]') return true

  try {
    const content = JSON.parse(data).choices?.[0]?.delta?.content
    if (content) onChunk(content)
  } catch {
    // Ignore keep-alive comments and partially-buffered JSON.
  }

  return false
}

const readStream = async (
  body: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      // Flush any multi-byte UTF-8 sequence still held by the decoder.
      buffer += decoder.decode()
      break
    }

    buffer += decoder.decode(value, { stream: true })

    // Server-sent events are newline-delimited; keep the trailing partial line.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (handleStreamLine(line, onChunk)) return
    }
  }

  if (buffer && handleStreamLine(buffer, onChunk)) {
    return
  }

  // Reaching here means the stream closed without a `[DONE]` sentinel, so the
  // response was truncated - surface it instead of reporting a partial success.
  throw new GenerationError('GENERATION_FAILED')
}

/**
 * Streams a cover letter from an OpenAI-compatible Chat Completions API using
 * the user's own API key. Each token is delivered through `onChunk` as it arrives.
 *
 * Uses the native `fetch` rather than the project's Axios + logger convention
 * because consuming an SSE stream requires `ReadableStream`
 * (`response.body.getReader()`), which Axios does not expose. Failures surface
 * to the caller and are reported via Sentry in the background worker.
 */
const generateCoverLetter = async (props: {
  apiKey: string
  endpoint: string
  model: string
  prompt: string
  signal?: AbortSignal
  onChunk: (chunk: string) => void
}): Promise<void> => {
  let response: Response
  try {
    response = await fetch(props.endpoint, {
      method: 'POST',
      signal: props.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.apiKey}`,
      },
      body: JSON.stringify({
        model: props.model,
        stream: true,
        messages: [{ role: 'user', content: props.prompt }],
      }),
    })
  } catch (error) {
    if (props.signal?.aborted) {
      throw error
    }

    throw new GenerationError('NETWORK_ERROR')
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new GenerationError(getErrorCode(response.status, details))
  }

  if (!response.body) {
    throw new GenerationError('GENERATION_FAILED')
  }

  await readStream(response.body, props.onChunk)
}

export default { generateCoverLetter, isGenerationError }
