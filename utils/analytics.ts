import extension from './extension'
import stateStorage from './globalState'

const GA_MEASUREMENT_TIME_MS = 100
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
const GA_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect'

enum Event {
  PAGE_VIEW = 'page_view',
  JOB_CLICK = 'job_click',
  DAILY_REPORT = 'daily_report',
  DEBUG_MODE_TRIGGERED = 'debug_mode_triggered',
}

const sendEvent = async (props: {
  event: Event
  params?: any
}): Promise<void> => {
  const GA_API_SECRET = import.meta.env.WXT_GA_API_SECRET
  const GA_MEASUREMENT_ID = import.meta.env.WXT_GA_MEASUREMENT_ID

  const globalState = await stateStorage.get()
  const endpoint = extension.debugEnabled ? GA_DEBUG_ENDPOINT : GA_ENDPOINT

  try {
    const response = await fetch(
      `${endpoint}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: globalState.instanceId,
          events: [
            {
              name: props.event,
              params: {
                ...props.params,
                extensionVersion: extension.version,
                engagement_time_msec: GA_MEASUREMENT_TIME_MS,
                created_at: Date.now(),
              },
            },
          ],
        }),
      }
    )

    if (extension.debugEnabled) {
      console.log(await response.text())
    }
  } catch {
    // Ignore
  }
}

export default { Event, sendEvent }
