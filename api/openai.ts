const ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

/**
 * Streams a cover letter from the OpenAI Chat Completions API using the user's
 * own API key. Each token is delivered through `onChunk` as it arrives.
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
      Authorization: `Bearer ${props.apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [{ role: 'user', content: props.prompt }],
    }),
  })

  if (!response.ok || !response.body) {
    const details = await response.text().catch(() => '')
    throw new Error(`OpenAI request failed (${response.status}): ${details}`)
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
      if (data === '[DONE]') return

      let content: string | undefined
      try {
        content = JSON.parse(data).choices?.[0]?.delta?.content
      } catch {
        // Ignore keep-alive comments and partially-buffered JSON.
      }

      if (content) props.onChunk(content)
    }
  }

  // Reaching here means the stream closed without a `[DONE]` sentinel, so the
  // response was truncated — surface it instead of reporting a partial success.
  throw new Error('OpenAI stream ended before completion')
}

export default { generateCoverLetter }
