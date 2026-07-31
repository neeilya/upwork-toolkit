import { Job } from '@/api/upwork'
import { createContext } from 'react'
import jobStorage from '@/utils/jobs'
import promptStorage from '@/utils/prompt'
import globalState, { GlobalState } from '@/utils/globalState'
import jobFiltersStorage, { JobFiltersConfig } from '@/utils/jobFilters'

export type StorageInterface = {
  initialized: boolean
  jobs: Job[]
  prompt: string
  globalState: GlobalState
  jobFilters: JobFiltersConfig

  setJobs: typeof jobStorage.save
  setState: typeof globalState.save
  setPrompt: typeof promptStorage.save
  setJobFilters: typeof jobFiltersStorage.save
}

const StorageContext = createContext<StorageInterface>({
  initialized: false,
  jobs: [],
  prompt: '',
  globalState: globalState.getDefaultState(),
  jobFilters: jobFiltersStorage.getDefaultConfig(),

  setJobs: Promise.resolve,
  setState: Promise.resolve,
  setPrompt: Promise.resolve,
  setJobFilters: Promise.resolve,
})

export default StorageContext
