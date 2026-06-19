import { storage } from '#imports'
import { Job } from '@/api/upwork'
import isFunction from 'lodash/isFunction'

const namespace = 'local:__JOBS'
const getAll = () => storage.getItem<Job[] | null>(namespace)

const save = async (arg: Job[] | ((jobs: Job[]) => Job[])): Promise<Job[]> => {
  const updatedState = isFunction(arg) ? arg((await getAll()) ?? []) : arg
  await storage.setItem(namespace, updatedState)
  return updatedState
}

const addEventListener = (
  callback: (newJobs: Job[] | null, oldJobs: Job[] | null) => void
) => storage.watch<Job[]>(namespace, callback)

export default { addEventListener, getAll, save }
