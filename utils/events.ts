import mitt from 'mitt'

export type PageJobDetails = {
  title: string
  description: string
}

export enum Event {
  GENERATE_COVER_LETTER_CLICK = 'generate_cover_letter_click',
  JOB_DETAILS_RECEIVED = 'job_details_received',
  DEBUG_MODE_TRIGGERED = 'debug_mode_triggered',
  UNSEEN_IDS_UPDATED = 'unseen_ids_updated',
}

type Events = {
  [Event.GENERATE_COVER_LETTER_CLICK]: void
  [Event.JOB_DETAILS_RECEIVED]: PageJobDetails
  [Event.DEBUG_MODE_TRIGGERED]: void
  [Event.UNSEEN_IDS_UPDATED]: string[]
}

export const eventEmitter = mitt<Events>()
