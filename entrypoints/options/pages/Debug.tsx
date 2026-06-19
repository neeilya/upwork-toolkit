import { useContext } from 'react'
import { RestartAlt } from '@mui/icons-material'
import globalState from '@/utils/globalState'
import { Button, Paper, Typography } from '@mui/material'
import Storage, { StorageInterface } from '@/contexts/storage'

const Debug = () => {
  const storage = useContext<StorageInterface>(Storage)

  const onGlobalStateReset = async () => {
    const currentState = await globalState.get()

    await storage.setState({
      ...globalState.getDefaultState(),
      instanceId: currentState.instanceId,
    })
  }

  return (
    <>
      <Button
        color="warning"
        variant="contained"
        startIcon={<RestartAlt />}
        onClick={onGlobalStateReset}
      >
        Global state
      </Button>

      <Button
        sx={{ ml: 2 }}
        color="warning"
        variant="contained"
        startIcon={<RestartAlt />}
        onClick={() => storage.setJobs([])}
      >
        Jobs storage
      </Button>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mt: 3,
          mb: 3,
          wordBreak: 'break-word',
          whiteSpace: 'break-spaces',
        }}
      >
        <Typography sx={{ mb: 1 }} variant="h6" component="h6">
          Global state
        </Typography>

        {JSON.stringify(storage.globalState, null, 2)}
      </Paper>

      <Paper sx={{ p: 3 }} variant="outlined">
        <Typography sx={{ mb: 1 }} variant="h6" component="h6">
          Job storage
        </Typography>

        <ol>
          {storage.jobs.map((job) => (
            <Typography
              component="li"
              key={job.ciphertext}
              sx={{
                mt: 3,
                wordBreak: 'break-word',
                whiteSpace: 'break-spaces',
              }}
            >
              {JSON.stringify(job, null, 2)}
            </Typography>
          ))}
        </ol>
      </Paper>
    </>
  )
}

export default Debug
