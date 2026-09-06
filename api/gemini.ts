const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`

/**
 * Streams a cover letter from the Google Gemini API using the user's own API
 * key (Google AI Studio issues free-tier keys for this model). Each token is
 * delivered through `onChunk` as it arrives.
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
  const url = `${ENDPOINT}?alt=sse&key=${encodeURIComponent(props.apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    signal: props.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: props.prompt }] }],
    }),
  })

  if (!response.ok || !response.body) {
    const details = await response.text().catch(() => '')
    throw new Error(`Gemini request failed (${response.status}): ${details}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let receivedAnyChunk = false

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

      if (event.error) {
        throw new Error(`Gemini stream error: ${event.error?.message ?? 'unknown error'}`)
      }

      const text = event.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        receivedAnyChunk = true
        props.onChunk(text)
      }
    }
  }

  // Gemini's stream has no explicit completion sentinel — reaching a clean
  // end without ever seeing text means the response was empty or truncated.
  if (!receivedAnyChunk) {
    throw new Error('Gemini stream ended before completion')
  }
}

export default { generateCoverLetter }
