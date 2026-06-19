import {
  BrowserClient,
  defaultStackParser,
  EventHint,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from '@sentry/browser'
import extension from './extension'
import globalState from './globalState'

const errorsToIgnore = [
  'No SW',
  'Failed to fetch',
  'FILE_ERROR_NO_SPACE',
  'The browser is shutting down',
  'Extension context invalidated',
  'Corruption: block checksum mismatch',
  'Could not establish connection. Receiving end does not exist.',
]

const client = new BrowserClient({
  beforeSend: async (event, hint) => {
    const errorMessage = event.exception?.values?.[0]?.value || ''

    if (
      errorsToIgnore.some((error) =>
        errorMessage.toLowerCase().includes(error.toLowerCase())
      )
    ) {
      return null
    }

    try {
      return {
        ...event,
        extra: {
          ...hint.data,
          ...event.extra,
          globalState: await globalState.get(),
        },
      }
    } catch {
      return { ...event, extra: { ...event.extra, ...hint.data } }
    }
  },
  dsn: import.meta.env.WXT_SENTRY_DSN,
  debug: import.meta.env.DEV,
  environment: import.meta.env.MODE,
  integrations: getDefaultIntegrations({}).filter(
    (defaultIntegration) =>
      !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(
        defaultIntegration.name
      )
  ),
  release: extension.version,
  stackParser: defaultStackParser,
  transport: makeFetchTransport,
})

const scope = new Scope()
scope.setClient(client)

export const captureException = (error: any, hint?: EventHint) =>
  client.captureException(error, hint, scope)

export const captureEvent = (event: any, hint?: EventHint) =>
  client.captureEvent(event, hint, scope)
