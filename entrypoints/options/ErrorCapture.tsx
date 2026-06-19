import Bug from '@/icons/Bug'
import { Component, ReactNode } from 'react'
import { RestartAlt } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { captureException } from '@/utils/sentry'

type Props = {
  children: ReactNode
}

type State = {
  error: any
}

class ErrorCapture extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { error }
  }

  async componentDidCatch(error: any) {
    captureException(error)
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ pt: 8, textAlign: 'center' }}>
          <Bug sx={{ fontSize: '20rem' }} />

          <Typography variant="h6" component="h6" sx={{ mt: 2 }}>
            Whoops, something went wrong
          </Typography>

          <Typography sx={{ mt: 0.5 }}>
            No worries, we've received a report and will fix this ASAP!
          </Typography>

          <Button
            sx={{ mt: 2 }}
            endIcon={<RestartAlt />}
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorCapture
