import { storage } from '#imports'
import { FeedType } from '@/api/upwork'
import isFunction from 'lodash/isFunction'
import { v4 } from 'uuid'
import { ErrorType } from './errors'
import extension from './extension'

const namespace = 'sync:__STATE'
export type DarkMode = 'true' | 'false' | 'system'

export type Schedule = {
  id: string
  days: number[]
  from: string
  to: string
}

/**
 * Global state persisted in cloud storage
 */
export type GlobalState = {
  instanceId: string
  enabled: boolean
  darkMode: DarkMode
  compactList: boolean
  // @deprecated
  readAlertIds: string[]
  openProposalPage: boolean
  feedType: FeedType
  lastLoginAttemptAt: number | null
  lastCaptchaAttemptAt: number | null
  lastCycleStartedAt: number
  lastCycleError: ErrorType | null

  readAlerts: {
    id: string
    read_at: number
  }[]

  soundSettings: {
    volume: number
    enabled: boolean
  }

  schedulingEnabled: boolean
  schedules: Schedule[]
  usTimeFormat: boolean

  usernameHash: string | null
}

const getDefaultState = (): GlobalState => ({
  instanceId: v4(),
  enabled: true,
  darkMode: 'system',
  compactList: true,
  readAlerts: [],
  readAlertIds: [],
  openProposalPage: true,
  lastLoginAttemptAt: null,
  lastCaptchaAttemptAt: null,
  feedType: FeedType.MyFeed,

  lastCycleError: null,
  lastCycleStartedAt: 0,

  soundSettings: {
    volume: 100,
    enabled: !extension.debugEnabled,
  },

  schedulingEnabled: false,
  schedules: [],
  usTimeFormat: false,

  usernameHash: null,
})

const get = () =>
  storage.getItem<GlobalState>(namespace, { fallback: getDefaultState() })

const save = async (
  arg: Partial<GlobalState> | ((previousState: GlobalState) => GlobalState)
): Promise<GlobalState> => {
  const updatedState = isFunction(arg)
    ? arg(await get())
    : { ...(await get()), ...arg }

  await storage.setItem<GlobalState>(namespace, updatedState)
  return updatedState
}

const addEventListener = (
  callback: (newState: GlobalState | null, oldState: GlobalState | null) => void
) => storage.watch<GlobalState>(namespace, callback)

export default {
  addEventListener,
  getDefaultState,
  get,
  save,
}
