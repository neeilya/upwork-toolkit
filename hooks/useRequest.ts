import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'

type LoadingStatus = 'idle' | 'loading' | 'success' | 'error'

const useRequest = <D extends any, R extends any[]>(props: {
  request: (...args: R) => Promise<D>
  onSuccess?: (data: D) => void
  onError?: (error: AxiosError) => void
}) => {
  const [data, setData] = useState<D | null>(null)
  const [error, setError] = useState<AxiosError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('idle')

  const request = async (...args: R) => {
    setError(null)
    setLoadingStatus('loading')

    try {
      const response = await props.request(...args)

      setData(response)
      setLoadingStatus('success')

      props.onSuccess?.(response)
    } catch (error) {
      setError(error as AxiosError)
      setLoadingStatus('error')

      props.onError?.(error as AxiosError)
    }
  }

  return {
    data,
    error,
    request,
    loadingStatus,
    loading: loadingStatus === 'loading',
  }
}

export default useRequest
