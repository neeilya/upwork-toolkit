import { Job } from '@/api/upwork'
import { createContext } from 'react'
import jobStorage from '@/utils/jobs'
import promptStorage from '@/utils/prompt'
import globalState, { GlobalState } from '@/utils/globalState'

export type StorageInterface = {
  initialized: boolean
  jobs: Job[]
  prompt: string
  globalState: GlobalState

  setJobs: typeof jobStorage.save
  setState: typeof globalState.save
  setPrompt: typeof promptStorage.save
}

const StorageContext = createContext<StorageInterface>({
  initialized: false,
  jobs: [],
  prompt: '',
  globalState: globalState.getDefaultState(),

  setJobs: Promise.resolve,
  setState: Promise.resolve,
  setPrompt: Promise.resolve,
})

export default StorageContext
