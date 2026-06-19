import { Job } from '@/api/upwork'
import jobStorage from '@/utils/jobs'
import promptStorage from '@/utils/prompt'
import { GlobalState } from '@/utils/globalState'
import globalState from '@/utils/globalState'
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

  const exposedApi: StorageInterface = {
    jobs,
    prompt,
    initialized,
    globalState: state,
    setJobs: jobStorage.save,
    setState: globalState.save,
    setPrompt: promptStorage.save,
  }

  useEffect(() => {
    const initializeStorage = async () => {
      const [freshState, freshJobs, freshPrompt] = await Promise.all([
        globalState.get(),
        jobStorage.getAll(),
        promptStorage.get(),
      ])

      setJobs(freshJobs ?? [])
      setState(freshState)
      setPrompt(freshPrompt)

      jobStorage.addEventListener((newJobs) => setJobs(newJobs ?? []))
      globalState.addEventListener((newState) =>
        setState(newState ?? globalState.getDefaultState())
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
