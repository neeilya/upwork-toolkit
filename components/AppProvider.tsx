import Storage, { StorageInterface } from '@/contexts/storage'
import createTheme from '@/theme'
import { darkMode } from '@/utils/system'
import { CssBaseline, ScopedCssBaseline, ThemeProvider } from '@mui/material'
import { ReactNode, useContext, useEffect, useState } from 'react'

const AppProvider = (props: {
  children: ReactNode
  disableDarkMode?: boolean
  scopedCssBaseline?: boolean
}) => {
  const storage = useContext<StorageInterface>(Storage)
  const [systemDarkMode, setSystemDarkMode] = useState(darkMode)

  const BaselineComponent = props.scopedCssBaseline
    ? ScopedCssBaseline
    : CssBaseline

  useEffect(
    () =>
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) =>
          setSystemDarkMode(event.matches)
        ),
    []
  )

  return (
    <ThemeProvider
      theme={createTheme({
        appInitialized: storage.initialized,
        darkMode:
          storage.initialized &&
          !props.disableDarkMode &&
          (storage.globalState.darkMode === 'true' ||
            (storage.globalState.darkMode === 'system' && systemDarkMode)),
      })}
    >
      <BaselineComponent
        sx={{
          backgroundColor: props.scopedCssBaseline ? 'transparent' : undefined,
        }}
      >
        {props.children}
      </BaselineComponent>
    </ThemeProvider>
  )
}

export default AppProvider
