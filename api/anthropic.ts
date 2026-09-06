const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5'
const ANTHROPIC_VERSION = '2023-06-01'

/**
 * Streams a cover letter from the Anthropic Messages API using the user's own
 * API key. Each token is delivered through `onChunk` as it arrives.
 *
 * Uses the native `fetch` rather than the project's Axios + logger convention
 * because consuming an SSE stream requires `ReadableStream`
 * (`response.body.getReader()`), which Axios does not expose. Failures surface
 * to the caller and are reported via Sentry in the background worker.
 */
const generateCoverLetter = async (props: {
  apiKey: string
  prompt: string
  signal?: AbortSignal
  onChunk: (chunk: string) => void
}): Promise<void> => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    signal: props.signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': props.apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      // Anthropic's API rejects browser-origin requests by default; this
      // header opts into direct browser access for this BYOK, no-backend flow.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'user', content: props.prompt }],
    }),
  })

  if (!response.ok || !response.body) {
    const details = await response.text().catch(() => '')
    throw new Error(`Anthropic request failed (${response.status}): ${details}`)
  }

  const reader = response.body.getReader()
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
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const data = trimmed.slice('data:'.length).trim()

      let event: any
      try {
        event = JSON.parse(data)
      } catch {
        // Ignore keep-alive comments and partially-buffered JSON.
        continue
      }

      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        props.onChunk(event.delta.text)
      }

      if (event.type === 'error') {
        throw new Error(
          `Anthropic stream error: ${event.error?.message ?? 'unknown error'}`
        )
      }

      if (event.type === 'message_stop') return
    }
  }

  // Reaching here means the stream closed without a `message_stop` event, so
  // the response was truncated — surface it instead of reporting a partial success.
  throw new Error('Anthropic stream ended before completion')
}

export default { generateCoverLetter }
