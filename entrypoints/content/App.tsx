import { Event, eventEmitter } from '@/utils/events'
import { useEffect, useState } from 'react'
import ChatGptDialog from './ChatGptDialog'
import jobDetailsReader, { PageJobDetails } from './jobDetails'

const App = (props: {
  eventEmitter: typeof eventEmitter
  onInsert: (template: string) => void
}) => {
  const [showChatGptDialog, setShowChatGptDialog] = useState(false)
  const [jobDetails, setJobDetails] = useState<PageJobDetails | null>(null)

  const openChatGptDialog = () => setShowChatGptDialog(true)

  const jobTitle = jobDetails?.title
  const jobDescription = jobDetails?.description

  useEffect(() => {
    const readJobDetails = async () => {
      const details = await jobDetailsReader.getJobDetailsFromPage()

      if (!details) {
        return
      }

      setJobDetails(details)
      props.eventEmitter.emit(Event.JOB_DETAILS_RECEIVED, details)
    }

    readJobDetails()
  }, [])

  useEffect(() => {
    props.eventEmitter.on(Event.GENERATE_COVER_LETTER_CLICK, openChatGptDialog)

    return () => {
      props.eventEmitter.off(
        Event.GENERATE_COVER_LETTER_CLICK,
        openChatGptDialog
      )
    }
  }, [])

  return showChatGptDialog && jobTitle && jobDescription ? (
    <ChatGptDialog
      onClose={() => setShowChatGptDialog(false)}
      onInsert={(template) => {
        props.onInsert(template)
        setShowChatGptDialog(false)
      }}
      jobTitle={jobTitle}
      jobDescription={jobDescription}
    />
  ) : null
}

export default App
