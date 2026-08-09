import { browser } from '#imports'
import mobileNotificationsApi from '@/api/mobileNotifications'
import useMediaQuery from '@/hooks/useMediaQuery'
import errors from '@/utils/errors'
import mobileNotificationsStorage, {
  getDefaultConfig,
  MobileNotificationsConfig,
  MobileProvider,
  NTFY_DEFAULT_SERVER,
} from '@/utils/mobileNotifications'
import { captureException } from '@/utils/sentry'
import {
  ExpandMore,
  OpenInNew,
  Save,
  Send,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { ReactNode, useEffect, useState } from 'react'

/** Shows the first and last few characters, masking the rest. */
const maskSecret = (value: string) => {
  const trimmed = value.trim()

  if (trimmed.length <= 7) {
    return '•'.repeat(trimmed.length)
  }

  return `${trimmed.slice(0, 3)}${'•'.repeat(8)}${trimmed.slice(-4)}`
}

const A = (props: { href: string; children: ReactNode }) => (
  <Link href={props.href} target="_blank" rel="noopener noreferrer">
    {props.children}
    <OpenInNew sx={{ verticalAlign: 'middle', fontSize: '100%' }} />
  </Link>
)

/** Collapsible numbered setup instructions shown inside a provider section. */
const SetupGuide = ({ steps }: { steps: ReactNode[] }) => (
  <Accordion
    disableGutters
    elevation={0}
    sx={{
      mt: 1.5,
      overflow: 'hidden',
      borderRadius: 1,
      bgcolor: 'action.hover',
      '&:before': { display: 'none' },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={{ '& .MuiAccordionSummary-content': { my: 1 } }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Step-by-step setup guide
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      <Box
        component="ol"
        sx={{
          m: 0,
          pl: 2.5,
          '& li': { mb: 1, pl: 0.5 },
          '& li:last-of-type': { mb: 0 },
          '& code': {
            px: 0.5,
            py: '1px',
            borderRadius: 0.5,
            bgcolor: 'action.selected',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            overflowWrap: 'anywhere',
          },
        }}
      >
        {steps.map((step, index) => (
          <Typography
            key={index}
            component="li"
            variant="body2"
            color="text.secondary"
          >
            {step}
          </Typography>
        ))}
      </Box>
    </AccordionDetails>
  </Accordion>
)

const MobileNotifications = () => {
  const { isMobile } = useMediaQuery()
  const { enqueueSnackbar } = useSnackbar()

  const [config, setConfig] =
    useState<MobileNotificationsConfig>(getDefaultConfig())
  const [savedConfig, setSavedConfig] =
    useState<MobileNotificationsConfig>(getDefaultConfig())
  const [initialized, setInitialized] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [editingToken, setEditingToken] = useState(false)
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  const isBusy = (key: string) => Boolean(busy[key])
  const withBusy = (key: string, value: boolean) =>
    setBusy((prev) => ({ ...prev, [key]: value }))

  const hasToken = savedConfig.telegram.botToken.trim().length > 0
  const showTokenForm = !hasToken || editingToken

  useEffect(() => {
    const init = async () => {
      const stored = await mobileNotificationsStorage.get()
      setConfig(stored)
      setSavedConfig(stored)
      setInitialized(true)
    }

    init()
  }, [])

  const updateProvider = <P extends MobileProvider>(
    provider: P,
    patch: Partial<MobileNotificationsConfig[P]>
  ) =>
    setConfig((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], ...patch },
    }))

  const onToggleProvider = async (
    provider: MobileProvider,
    enabled: boolean
  ) => {
    // Enabling a provider that talks to an arbitrary host needs permission first
    // (mirrors Save/Test); leave it disabled if the host check fails.
    if (enabled && !(await ensureProviderHost(provider))) return

    updateProvider(provider, { enabled })

    try {
      setSavedConfig(
        await mobileNotificationsStorage.save({ [provider]: { enabled } })
      )
    } catch (error) {
      captureException(error)
      enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
    }
  }

  /**
   * Ask Chrome for permission to reach an arbitrary host (generic webhook or a
   * custom ntfy server). Must run first inside a click handler to keep the user
   * gesture. Hosts already in the manifest resolve to true without a prompt.
   */
  const ensureHost = async (rawUrl: string): Promise<boolean> => {
    let origin: string

    try {
      const url = new URL(rawUrl)

      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error('unsupported protocol')
      }

      // Build the pattern from the hostname, not the origin: match patterns
      // must not contain a port, and a port-less pattern covers every port.
      origin = `${url.protocol}//${url.hostname}/*`
    } catch {
      enqueueSnackbar('Please enter a valid URL (including https://)', {
        variant: 'error',
      })
      return false
    }

    try {
      const granted = await browser.permissions.request({ origins: [origin] })

      if (!granted) {
        enqueueSnackbar('Permission to reach that host was denied', {
          variant: 'error',
        })
      }

      return granted
    } catch (error) {
      enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
      return false
    }
  }

  const ensureProviderHost = (provider: MobileProvider): Promise<boolean> => {
    if (provider === 'telegram') return Promise.resolve(true)

    return ensureHost(
      (provider === 'ntfy' ? config.ntfy.serverUrl : config.webhook.url).trim()
    )
  }

  const onSaveProvider = async (provider: MobileProvider) => {
    if (config[provider].enabled && !(await ensureProviderHost(provider))) {
      return
    }

    const key = `save:${provider}`
    withBusy(key, true)

    try {
      const saved = await mobileNotificationsStorage.save({
        [provider]: config[provider],
      })
      setSavedConfig(saved)

      if (provider === 'telegram') {
        setEditingToken(false)
        setShowToken(false)
      }

      enqueueSnackbar('Your changes have been saved', { variant: 'success' })
    } catch (error) {
      captureException(error)
      enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
    } finally {
      withBusy(key, false)
    }
  }

  const onTestProvider = async (provider: MobileProvider) => {
    if (!(await ensureProviderHost(provider))) return

    const key = `test:${provider}`
    withBusy(key, true)

    try {
      // Persist the form first and test the saved values — real alerts read the
      // stored config, so a test must never pass with credentials that only
      // exist in unsaved form state.
      const saved = await mobileNotificationsStorage.save({
        [provider]: config[provider],
      })
      setSavedConfig(saved)

      if (provider === 'telegram') {
        setEditingToken(false)
        setShowToken(false)
      }

      await mobileNotificationsApi.sendTest(provider, saved)

      // The test bypasses the enable switch; warn when real alerts would
      // still be skipped so a passing test can't hide a disabled provider.
      if (!saved[provider].enabled) {
        enqueueSnackbar(
          `Test sent, but the ${provider} switch is off — real job alerts will not be sent`,
          { variant: 'warning' }
        )
      } else {
        enqueueSnackbar('Test notification sent — check your phone', {
          variant: 'success',
        })
      }
    } catch (error) {
      enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
    } finally {
      withBusy(key, false)
    }
  }

  const onEditToken = () => {
    updateProvider('telegram', { botToken: savedConfig.telegram.botToken })
    setEditingToken(true)
  }

  const onCancelEditToken = () => {
    updateProvider('telegram', { botToken: savedConfig.telegram.botToken })
    setShowToken(false)
    setEditingToken(false)
  }

  const actionButtons = (provider: MobileProvider, canSave: boolean) => (
    <Box sx={{ mt: 3, textAlign: 'right' }}>
      <Button
        color="inherit"
        endIcon={<Send />}
        sx={{ mr: 1 }}
        onClick={() => onTestProvider(provider)}
        disabled={!initialized || isBusy(`test:${provider}`)}
      >
        Send test
      </Button>

      <Button
        color="primary"
        endIcon={<Save />}
        variant="contained"
        fullWidth={isMobile}
        onClick={() => onSaveProvider(provider)}
        disabled={!initialized || !canSave || isBusy(`save:${provider}`)}
      >
        Save
      </Button>
    </Box>
  )

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" component="h6">
        Get new job alerts on your phone
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>How this works</AlertTitle>
        When new jobs are found, the extension also sends an alert to your phone
        through a service below. Because everything runs in your browser, alerts
        arrive{' '}
        <strong>only while this computer is on and Chrome is running</strong>.
        They honor the same enable switch and working-hours schedule as desktop
        notifications.
      </Alert>

      {/* Telegram */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.telegram.enabled}
              disabled={!initialized}
              onChange={(e) => onToggleProvider('telegram', e.target.checked)}
            />
          }
          label={<strong>Telegram</strong>}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Receive alerts as messages from your own Telegram bot.
        </Typography>

        <SetupGuide
          steps={[
            <>
              Open Telegram and start a chat with{' '}
              <A href="https://t.me/BotFather">@BotFather</A>. Send{' '}
              <code>/newbot</code> and follow the prompts (pick a name, then a
              username ending in <code>bot</code>).
            </>,
            <>
              BotFather replies with a <strong>bot token</strong> like{' '}
              <code>123456789:ABCdefGhIJKlm...</code>. Paste it into the{' '}
              <strong>Bot token</strong> field below.
            </>,
            <>
              Open a chat with your new bot and send it any message (e.g.{' '}
              <code>hi</code>). A bot can only message you after you message it
              first.
            </>,
            <>
              Get your <strong>Chat ID</strong>: in your browser open{' '}
              <code>https://api.telegram.org/bot&lt;token&gt;/getUpdates</code>,
              putting your token right after <code>bot</code> with{' '}
              <strong>no angle brackets</strong> — e.g.{' '}
              <code>
                https://api.telegram.org/bot123456789:ABCdef.../getUpdates
              </code>
              . Find{' '}
              <code>
                "chat":{'{'}"id":123456789{'}'}
              </code>{' '}
              in the response — that number is your Chat ID. (If you see{' '}
              <code>"result":[]</code>, message your bot first, then reload.)
            </>,
            <>
              Click <strong>Send test</strong> — a message should arrive on your
              phone within a couple of seconds. To post to a group instead, add
              the bot to the group and use the group's chat ID (it starts with{' '}
              <code>-</code>).
            </>,
          ]}
        />

        {showTokenForm ? (
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Bot token"
            placeholder="123456:ABC-DEF..."
            value={config.telegram.botToken}
            type={showToken ? 'text' : 'password'}
            onChange={(e) =>
              updateProvider('telegram', { botToken: e.target.value })
            }
            disabled={!initialized}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => setShowToken((prev) => !prev)}
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              },
            }}
          />
        ) : null}

        {showTokenForm && hasToken && (
          <Box sx={{ mt: 1, textAlign: 'right' }}>
            <Button color="inherit" size="small" onClick={onCancelEditToken}>
              Cancel
            </Button>
          </Box>
        )}

        {!showTokenForm && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              disabled
              label="Bot token"
              value={maskSecret(savedConfig.telegram.botToken)}
            />

            <Button color="primary" variant="outlined" onClick={onEditToken}>
              Edit
            </Button>
          </Box>
        )}

        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Chat ID"
          placeholder="123456789"
          value={config.telegram.chatId}
          onChange={(e) =>
            updateProvider('telegram', { chatId: e.target.value })
          }
          disabled={!initialized}
        />

        {actionButtons(
          'telegram',
          Boolean(
            config.telegram.botToken.trim() && config.telegram.chatId.trim()
          )
        )}
      </Paper>

      {/* ntfy */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.ntfy.enabled}
              disabled={!initialized}
              onChange={(e) => onToggleProvider('ntfy', e.target.checked)}
            />
          }
          label={<strong>ntfy</strong>}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          The simplest option — a free, open-source push app. No account needed.
        </Typography>

        <SetupGuide
          steps={[
            <>
              Install the <strong>ntfy</strong> app:{' '}
              <A href="https://apps.apple.com/app/ntfy/id1625396347">
                iOS App Store
              </A>
              ,{' '}
              <A href="https://play.google.com/store/apps/details?id=io.heckel.ntfy">
                Google Play
              </A>
              .
            </>,
            <>
              In the app, tap <strong>+</strong> and subscribe to a new{' '}
              <strong>topic</strong>. Pick a long, hard-to-guess name — anyone
              who knows the topic can send you notifications (e.g.{' '}
              <code>upwork-alerts-7f3k9x</code>).
            </>,
            <>
              Enter that exact topic in the <strong>Topic</strong> field below.
              Leave <strong>Server URL</strong> as <code>https://ntfy.sh</code>{' '}
              unless you run your own ntfy server.
            </>,
            <>
              Click <strong>Send test</strong> — your phone should show a
              notification. Tapping it opens the job.
            </>,
          ]}
        />

        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Topic"
          placeholder="my-upwork-alerts-9f3k"
          value={config.ntfy.topic}
          onChange={(e) => updateProvider('ntfy', { topic: e.target.value })}
          disabled={!initialized}
        />

        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Server URL"
          placeholder={NTFY_DEFAULT_SERVER}
          value={config.ntfy.serverUrl}
          onChange={(e) =>
            updateProvider('ntfy', { serverUrl: e.target.value })
          }
          disabled={!initialized}
          helperText="Change only if you self-host ntfy."
        />

        {actionButtons(
          'ntfy',
          Boolean(config.ntfy.topic.trim() && config.ntfy.serverUrl.trim())
        )}
      </Paper>

      {/* Webhook */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.webhook.enabled}
              disabled={!initialized}
              onChange={(e) => onToggleProvider('webhook', e.target.checked)}
            />
          }
          label={<strong>Webhook</strong>}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          POST new jobs to any automation platform or your own endpoint.
        </Typography>

        <SetupGuide
          steps={[
            <>
              Create an incoming webhook in your automation tool — Zapier
              (“Webhooks by Zapier → Catch Hook”), Make (“Custom webhook”),
              IFTTT (“Webhooks”), or your own HTTP endpoint. Just want to try
              it? Grab a free URL from{' '}
              <A href="https://webhook.site">webhook.site</A>.
            </>,
            <>
              Paste the full URL (starting with <code>https://</code>) in the
              field below. When you Save or Send test, Chrome asks permission to
              reach that host — click <strong>Allow</strong>.
            </>,
            <>
              On every batch of new jobs the extension sends a <code>POST</code>{' '}
              with a JSON body:{' '}
              <code>
                {
                  '{ "event": "new_jobs", "count", "jobs": [{ id, title, url, type, budget, postedAt, skills, description, client, … }] }'
                }
              </code>
              .
            </>,
            <>
              Click <strong>Send test</strong> to deliver a sample payload and
              confirm your automation receives it.
            </>,
          ]}
        />

        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Webhook URL"
          placeholder="https://hooks.example.com/..."
          value={config.webhook.url}
          onChange={(e) => updateProvider('webhook', { url: e.target.value })}
          disabled={!initialized}
        />

        {actionButtons('webhook', Boolean(config.webhook.url.trim()))}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary">
        Want alerts even when this computer is off? Run the extension on an
        always-on machine (a spare laptop, a Raspberry Pi, or a small cloud VM)
        and these notifications keep flowing 24/7.
      </Typography>
    </Box>
  )
}

export default MobileNotifications
