import { useEffect } from 'react'

const useKeyPress = (props: {
  key: string
  ctrlKey?: boolean
  onKeyPress: (...args: any[]) => any
}) =>
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) =>
      event.key === props.key &&
      (!props.ctrlKey || event.metaKey || event.ctrlKey) &&
      props.onKeyPress()

    window.addEventListener('keydown', onKeyPress)

    return () => window.removeEventListener('keydown', onKeyPress)
  }, [props.key, props.ctrlKey, props.onKeyPress])

export default useKeyPress
