import { storage } from '#imports'

const namespace = 'sync:__COVER_LETTER'

const get = () => storage.getItem<string>(namespace, { fallback: '' })

const save = async (value: string) => {
  await storage.setItem<string>(namespace, value)
  return value
}

export default { get, save }
