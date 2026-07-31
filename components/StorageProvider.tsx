import { Job } from '@/api/upwork'
import jobStorage from '@/utils/jobs'
import promptStorage from '@/utils/prompt'
import { GlobalState } from '@/utils/globalState'
import globalState from '@/utils/globalState'
import jobFiltersStorage, { JobFiltersConfig } from '@/utils/jobFilters'
import { ReactNode, useEffect, useState } from 'react'
import Storage, { StorageInterface } from '@/contexts/storage'
type Props = {
  children: ReactNode | ReactNode[]
}

const StorageProvider = (props: Props) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [prompt, setPrompt] = useState<string>('')
  const [initialized, setInitialized] = useState(false)
  const [state, setState] = useState<GlobalState>(globalState.getDefaultState)
  const [jobFilters, setJobFilters] = useState<JobFiltersConfig>(
    jobFiltersStorage.getDefaultConfig
  )

  const exposedApi: StorageInterface = {
    jobs,
    prompt,
    initialized,
    globalState: state,
    jobFilters,
    setJobs: jobStorage.save,
    setState: globalState.save,
    setPrompt: promptStorage.save,
    setJobFilters: jobFiltersStorage.save,
  }

  useEffect(() => {
    const initializeStorage = async () => {
      const [freshState, freshJobs, freshPrompt, freshFilters] =
        await Promise.all([
          globalState.get(),
          jobStorage.getAll(),
          promptStorage.get(),
          jobFiltersStorage.get(),
        ])

      setJobs(freshJobs ?? [])
      setState(freshState)
      setPrompt(freshPrompt)
      setJobFilters(freshFilters)

      jobStorage.addEventListener((newJobs) => setJobs(newJobs ?? []))
      globalState.addEventListener((newState) =>
        setState(newState ?? globalState.getDefaultState())
      )
      jobFiltersStorage.addEventListener((newFilters) =>
        setJobFilters(newFilters ?? jobFiltersStorage.getDefaultConfig())
      )

      setInitialized(true)
    }

    initializeStorage()
  }, [])

  return initialized ? (
    <Storage.Provider value={exposedApi}>{props.children}</Storage.Provider>
  ) : null
}

export default StorageProvider
