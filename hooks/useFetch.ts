import { type AxiosError } from 'axios'
import { useEffect, useState } from 'react'

type LoadingStatus = 'idle' | 'loading' | 'success' | 'error'

const useFetch = <D extends any>(props: {
  dependencies: any[]
  fetchFunction: () => Promise<D>
  onSuccess?: (data: D) => void
  onError?: (error: AxiosError) => void
}) => {
  const [data, setData] = useState<D | null>(null)
  const [error, setError] = useState<AxiosError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('idle')

  const fetchData = async () => {
    setError(null)
    setLoadingStatus('loading')

    try {
      const data = await props.fetchFunction()

      setData(data)
      setLoadingStatus('success')

      props.onSuccess?.(data)
    } catch (error) {
      setError(error as AxiosError)
      setLoadingStatus('error')

      props.onError?.(error as AxiosError)
    }
  }

  useEffect(() => {
    fetchData()
  }, props.dependencies)

  return {
    data,
    error,
    fetchData,
    setData,
    loadingStatus,
    loading: loadingStatus === 'loading',
  }
}

export default useFetch
