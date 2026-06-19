import { storage } from '#imports'

const namespace = 'sync:__OPENAI_API_KEY'

const get = () => storage.getItem<string>(namespace, { fallback: '' })

const save = async (value: string) => {
  await storage.setItem<string>(namespace, value)
  return value
}

const addEventListener = (
  callback: (newValue: string | null, oldValue: string | null) => void
) => storage.watch<string>(namespace, callback)

export default { get, save, addEventListener }
