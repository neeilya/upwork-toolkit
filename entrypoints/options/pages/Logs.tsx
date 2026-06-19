import { Box, Paper, Tabs, Tab, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import logger, { Entry } from '@/utils/logger'

const Logs = () => {
  const [logs, setLogs] = useState<Entry[] | null>([])
  const [initialized, setInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    logger.getAll().then((logs) => {
      setLogs(logs ?? [])
      setInitialized(true)

      logger.onChange(setLogs)
    })
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const formatMessage = (message: string) => {
    try {
      const json = JSON.parse(message)
      return (
        <Typography
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            p: 1,
            borderRadius: 1,
          }}
        >
          {JSON.stringify(json, null, 2)}
        </Typography>
      )
    } catch {
      return message
    }
  }

  const LogsView = () => (
    <Paper variant="outlined">
      <Box component="ul" sx={{ pr: 2 }}>
        {logs
          ?.filter((entry) => !entry.message.includes(logger.LOG_LABEL))
          .map((entry) => (
            <Box key={entry.id} component="li" sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {new Date(entry.timestamp).toLocaleString()}:{' '}
                {entry.type.toUpperCase()}
              </Typography>
              <Box sx={{ mt: 0.5 }}>{formatMessage(entry.message)}</Box>
            </Box>
          ))}
      </Box>
    </Paper>
  )

  const RequestsView = () => (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box component="ul" sx={{ pr: 2 }}>
        {logs
          ?.filter((entry) => entry.message.includes(logger.LOG_LABEL))
          .map((entry) => (
            <Box key={entry.id} component="li" sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {new Date(entry.timestamp).toLocaleString()}:{' '}
                {entry.type.toUpperCase()}
              </Typography>
              <Box sx={{ mt: 0.5 }}>{formatMessage(entry.message)}</Box>
            </Box>
          ))}
      </Box>
    </Paper>
  )

  return initialized ? (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Logs" />
          <Tab label="Requests" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 ? <LogsView /> : <RequestsView />}
      </Box>
    </Box>
  ) : null
}

export default Logs
