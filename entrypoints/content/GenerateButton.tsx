import useKeyPress from '@/hooks/useKeyPress'
import { Event, eventEmitter } from '@/utils/events'
import { helperKey } from '@/utils/system'
import { Button } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { PageJobDetails } from './jobDetails'

const GenerateButton = (props: { eventEmitter: typeof eventEmitter }) => {
  const [jobDetails, setJobDetails] = useState<PageJobDetails | null>(null)

  const onGenerateClick = useCallback(() => {
    props.eventEmitter.emit(Event.GENERATE_COVER_LETTER_CLICK)
  }, [props.eventEmitter])

  useEffect(() => {
    const onJobDetailsReceived = (jobDetails: PageJobDetails) => {
      setJobDetails(jobDetails)
    }

    props.eventEmitter.on(Event.JOB_DETAILS_RECEIVED, onJobDetailsReceived)

    return () => {
      props.eventEmitter.off(Event.JOB_DETAILS_RECEIVED, onJobDetailsReceived)
    }
  }, [props.eventEmitter])

  useKeyPress({
    key: 'Enter',
    ctrlKey: true,
    onKeyPress: onGenerateClick,
  })

  return jobDetails ? (
    <Button variant="contained" sx={{ mb: 2 }} onClick={onGenerateClick}>
      Generate ({helperKey} + Enter)
    </Button>
  ) : null
}

export default GenerateButton
