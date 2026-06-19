import { storage } from '#imports'
import { AxiosResponse } from 'axios'
import { v4 } from 'uuid'
import extension from './extension'

const namespace = 'local:__LOGS'
const LOG_LABEL = 'uptoolkit_logger_response'

export type Entry = {
  id: string
  message: string
  timestamp: number
  type: 'info' | 'warn' | 'error'
}

const entry = async (message: string | string[], type: Entry['type']) => {
  extension.debugEnabled &&
    console.log(Array.isArray(message) ? message.join(' ') : message)

  const generate = (message: string) => ({
    id: v4(),
    type,
    message,
    timestamp: Date.now(),
  })

  await storage.setItem(
    namespace,
    [
      ...((await storage.getItem<string[]>(namespace)) ?? []),
      generate(Array.isArray(message) ? message.join(' ') : message),
    ].slice(-1000)
  )
}

const info = (message: string | string[]) => entry(message, 'info')
const warn = (message: string | string[]) => entry(message, 'warn')
const error = (message: string | string[]) => entry(message, 'error')
const getAll = async () => (await storage.getItem<Entry[]>(namespace)) ?? []

const onChange = (
  callback: (newBatch: Entry[] | null, oldBatch: Entry[] | null) => void
) => storage.watch(namespace, callback)

const logRequest = (response: AxiosResponse) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  info(
    JSON.stringify({
      [LOG_LABEL]: {
        url: response.config.url,
        queryParams: response.config.params,
        method: response.config.method?.toUpperCase(),
        status: response.status,
        input: response.config.data,
        output: response.data,
      },
    })
  )

  return response
}

export default { info, warn, error, getAll, onChange, logRequest, LOG_LABEL }
