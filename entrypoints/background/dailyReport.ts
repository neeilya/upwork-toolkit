import analytics from '@/utils/analytics'
import stateStorage from '@/utils/globalState'
import upworkApi from '@/api/upwork'
import { sha256 } from '@/utils/crypt'
import { captureException } from '@/utils/sentry'

const getUsername = async () => {
  try {
    const username = await upworkApi.getUsername()
    if (username) return username

    const [jobsToken, usernameToken] = await Promise.all([
      upworkApi.getJobsToken(),
      upworkApi.getUsernameToken(),
    ])

    if (jobsToken && !usernameToken) {
      captureException(new Error('FAILED_TO_FETCH_USERNAME_TOKEN'))
    }

    return null
  } catch (error: any) {
    if (
      !upworkApi.isServerError(error) &&
      !upworkApi.isNetworkError(error) &&
      !upworkApi.isForbiddenError(error) &&
      !upworkApi.isRateLimitError(error) &&
      !upworkApi.isUnauthenticatedError(error)
    ) {
      captureException(error)
    }

    return null
  }
}

const dailyReport = async () => {
  const username = await getUsername()

  await stateStorage.save({
    usernameHash: username ? await sha256(username) : null,
  })

  const globalState = await stateStorage.get()

  await analytics.sendEvent({
    event: analytics.Event.DAILY_REPORT,
    params: {
      enabled: globalState.enabled,
      compactList: globalState.compactList,
      darkMode: globalState.darkMode,
      soundVolume: globalState.soundSettings.volume,
      soundEnabled: globalState.soundSettings.enabled,
      schedulingEnabled: globalState.schedulingEnabled,
      usernameHash: globalState.usernameHash,
    },
  })
}

export default dailyReport
