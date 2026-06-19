import { browser } from '#imports'
import upworkApi, { Job } from '@/api/upwork'
import Storage, { StorageInterface } from '@/contexts/storage'
import GirlReading from '@/icons/GirlReading'
import alerts, { Alert } from '@/utils/alerts'
import analytics from '@/utils/analytics'
import colors from '@/utils/colors'
import { ErrorType } from '@/utils/errors'
import extension from '@/utils/extension'
import notifications from '@/utils/notifications'
import {
  AlertTitle,
  Box,
  Button,
  FormControlLabel,
  Link,
  Alert as MuiAlert,
  Portal,
  Switch,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import JobList from '../JobList'
import { LayoutContext } from './Layout'
import { eventEmitter, Event } from '@/utils/events'

const alertInterval = extension.debugEnabled
  ? 10 * 1000 // 10 seconds
  : 24 * 60 * 60 * 1000 // 24 hours

const Home = () => {
  const { enqueueSnackbar } = useSnackbar()
  const storage = useContext<StorageInterface>(Storage)
  const { headerContainer } = useOutletContext<LayoutContext>()

  const [debugError, setDebugError] = useState<any>([])
  const [unseenIds, setUnseenIds] = useState<string[]>([])

  const jobsHash = Array.isArray(storage.jobs)
    ? storage.jobs
        .map((job) => job.ciphertext)
        .sort()
        .join('/')
    : ''

  const lastCycleError = storage.globalState.lastCycleError

  const loginAttempted =
    storage.globalState.lastLoginAttemptAt &&
    storage.globalState.lastLoginAttemptAt + 60000 > Date.now()

  const captchaAttempted =
    storage.globalState.lastCaptchaAttemptAt &&
    storage.globalState.lastCaptchaAttemptAt + 60000 > Date.now()

  const readAlertIds = [
    // Old alerts storage property (readAlertIds), do not use it anywhere else
    ...storage.globalState.readAlertIds,
    ...storage.globalState.readAlerts.map((alert) => alert.id),
  ]

  const unreadAlerts = alerts.filter(
    (alert) => !readAlertIds.includes(alert.id)
  )

  const lastReadAlert =
    storage.globalState.readAlerts.length > 0
      ? storage.globalState.readAlerts.slice(-1)[0]
      : null

  const unreadAlert =
    !lastReadAlert || lastReadAlert.read_at + alertInterval < Date.now()
      ? unreadAlerts[0]
      : null

  const onAlertClose = (alert: Alert) =>
    storage.setState({
      readAlerts: [
        ...storage.globalState.readAlerts,
        { id: alert.id, read_at: Date.now() },
      ],
    })

  const onJobClick = (job: Job) => {
    storage.globalState.openProposalPage &&
      window.open(upworkApi.proposalUrl(job.ciphertext), '_blank')

    window.open(upworkApi.viewUrl(job.ciphertext), '_blank')

    setUnseenIds((unseenIds) => unseenIds.filter((id) => id !== job.ciphertext))

    analytics.sendEvent({ event: analytics.Event.JOB_CLICK })
  }

  const renderAlert = () => {
    if (!storage.globalState.enabled) {
      return (
        <MuiAlert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Notifications are turned off</AlertTitle>

          <p>Click below to start receiving notifications.</p>

          <Button
            variant="contained"
            onClick={() => {
              storage.setState({ enabled: true })
              browser.action.setBadgeText({ text: '' })
              enqueueSnackbar('Notifications are enabled', {
                variant: 'success',
              })
            }}
          >
            Enable notifications
          </Button>
        </MuiAlert>
      )
    }

    if (lastCycleError === ErrorType.FORBIDDEN && !captchaAttempted) {
      return (
        <MuiAlert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Upwork doesn't believe you are human</AlertTitle>

          <p>
            No worries!
            <br />
            Just solve{' '}
            <Link
              target="_blank"
              rel="noreferrer noopener"
              href="https://www.upwork.com/nx/find-work"
              onClick={() =>
                storage.setState({ lastCaptchaAttemptAt: Date.now() })
              }
            >
              a captcha
            </Link>{' '}
            to keep extension working.
          </p>
        </MuiAlert>
      )
    }

    if (lastCycleError === ErrorType.SERVER_ERROR) {
      return (
        <MuiAlert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Server Error</AlertTitle>

          <p>
            Seems like Upwork API is down (received 500 response).
            <br />
            You don't need to do anything, just wait.
          </p>
        </MuiAlert>
      )
    }

    if (lastCycleError === ErrorType.OTHER) {
      return (
        <MuiAlert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Whoops, something went wrong!</AlertTitle>
          <p>
            Something went wrong during jobs fetching.
            <br />
            Don't worry, the bug has been reported and is being worked on.
          </p>
        </MuiAlert>
      )
    }

    if (lastCycleError === ErrorType.NETWORK_ERROR) {
      return (
        <MuiAlert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Network Error</AlertTitle>
          <p>
            Seems like you have network issues.
            <br />
            Please check your internet connection.
          </p>
        </MuiAlert>
      )
    }

    if (lastCycleError === ErrorType.UNAUTHENTICATED && !loginAttempted) {
      return (
        <MuiAlert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Authentication required</AlertTitle>

          <p>
            It seems like you are not authentincated on upwork.com website.
            <br />
            Please login and wait for extension to load jobs (~1 minute).
          </p>

          <Button
            size="small"
            component="a"
            target="_blank"
            variant="contained"
            rel="noreferrer noopener"
            href="https://www.upwork.com/ab/account-security/login"
            onClick={() => storage.setState({ lastLoginAttemptAt: Date.now() })}
          >
            Login
          </Button>
        </MuiAlert>
      )
    }

    if (!lastCycleError && unreadAlert) {
      return (
        <MuiAlert
          sx={{ mb: 3 }}
          variant={unreadAlert.variant}
          severity={unreadAlert.severity}
          onClose={() => onAlertClose(unreadAlert)}
        >
          <AlertTitle {...unreadAlert.titleProps}>
            {unreadAlert.title}
          </AlertTitle>

          <Box sx={{ mt: 2 }}>
            {unreadAlert.renderBody({
              onInteracted: () => onAlertClose(unreadAlert),
            })}
          </Box>
        </MuiAlert>
      )
    }
  }

  const alert = renderAlert()

  useEffect(() => {
    if (!storage.globalState.enabled) {
      browser.action.setBadgeText({ text: 'OFF' })
      browser.action.setBadgeBackgroundColor({ color: colors.orange })
      return
    }

    if (!lastCycleError) {
      notifications.clearAll()
      browser.action.setBadgeText({ text: '' })
      return
    }
    // eslint-disable-next-line
  }, [])

  useEffect(
    () =>
      setUnseenIds((previousIds) => [
        ...previousIds,
        ...storage.jobs
          .filter(
            (job) => !job.__isSeen && !previousIds.includes(job.ciphertext)
          )
          .map((job) => job.ciphertext),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobsHash]
  )

  useEffect(
    () => {
      const id = setInterval(async () => {
        const [currentTab, currentWindow] = await Promise.all([
          browser.tabs.getCurrent(),
          browser.windows.getCurrent(),
        ])

        currentTab?.active &&
          currentWindow?.focused &&
          storage.jobs.some((job) => !job.__isSeen) &&
          (await storage.setJobs((jobs) =>
            jobs.map((job) => ({ ...job, __isSeen: true }))
          ))
      }, 300)

      return () => clearInterval(id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobsHash]
  )

  useEffect(() => {
    eventEmitter.emit(Event.UNSEEN_IDS_UPDATED, unseenIds)

    return () => {
      eventEmitter.emit(Event.UNSEEN_IDS_UPDATED, [])
    }
  }, [unseenIds])

  return (
    <>
      {headerContainer.current && storage.jobs.length > 0 && (
        <Portal container={headerContainer.current}>
          <Box sx={{ textAlign: 'right' }}>
            <FormControlLabel
              label="Compact list"
              labelPlacement="start"
              slotProps={{ typography: { sx: { fontWeight: 500 } } }}
              control={
                <Switch
                  color="secondary"
                  onChange={(event, compactList) =>
                    storage.setState({ compactList })
                  }
                  defaultChecked={storage.globalState.compactList}
                  sx={{ '& .MuiSwitch-track': { backgroundColor: '#fff' } }}
                />
              }
            />
          </Box>
        </Portal>
      )}

      {alert}

      {extension.debugEnabled && (
        <>
          <Button onClick={() => setDebugError(null)}>Trigger error</Button>
          {debugError.map((error: any) => error)}
        </>
      )}

      {!lastCycleError &&
        !unreadAlert &&
        storage.jobs.length === 0 &&
        !alert && (
          <Box sx={{ textAlign: 'center' }}>
            <GirlReading sx={{ fontSize: '12rem' }} />

            <Typography variant="h6" component="h6">
              Sit back and relax
            </Typography>

            <Typography sx={{ mt: 0.5 }}>
              Extension will notify you when new jobs appear
            </Typography>
          </Box>
        )}

      <JobList
        jobs={storage.jobs}
        unseenIds={unseenIds}
        onJobClick={onJobClick}
        detailed={!storage.globalState.compactList}
      />
    </>
  )
}

export default Home
