import Faq from './pages/Faq'
import Home from './pages/Home'
import Logs from './pages/Logs'
import ErrorCapture from './ErrorCapture'
import Debug from './pages/Debug'
import Layout from './pages/Layout'
import { SnackbarProvider } from 'notistack'
import analytics from '@/utils/analytics'
import Settings from './pages/Settings'
import CoverLetter from './pages/CoverLetter'
import { useContext, useEffect, useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Route, Routes, HashRouter } from 'react-router-dom'
import Storage, { StorageInterface } from '@/contexts/storage'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import AppProvider from '@/components/AppProvider'

const App = () => {
  const storage = useContext<StorageInterface>(Storage)
  const [path, setPath] = useState(window.location.hash)

  useEffect(() => {
    const interval = setInterval(() => setPath(window.location.hash), 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    analytics.sendEvent({
      event: analytics.Event.PAGE_VIEW,
      params: { page_title: path, page_location: path },
    })
  }, [path])

  return (
    <AppProvider>
      <ErrorCapture>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {storage.initialized && (
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            >
              <HashRouter basename="">
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="faq" element={<Faq />} />
                    <Route path="logs" element={<Logs />} />
                    <Route path="debug" element={<Debug />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="cover-letter" element={<CoverLetter />} />
                  </Route>
                </Routes>
              </HashRouter>
            </SnackbarProvider>
          )}
        </LocalizationProvider>
      </ErrorCapture>
    </AppProvider>
  )
}

export default App
