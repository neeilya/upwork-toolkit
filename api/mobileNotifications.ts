import upworkApi, { Job } from '@/api/upwork'
import logger from '@/utils/logger'
import mobileNotificationsStorage, {
  MobileNotificationsConfig,
  MobileProvider,
} from '@/utils/mobileNotifications'
import moment from 'moment'

/**
 * Mobile notification relay.
 *
 * The extension has no backend, so it can't push to a phone directly. Instead
 * it POSTs to a third-party service that has its own mobile app (Telegram,
 * ntfy) or to a user-supplied webhook. Uses native `fetch` (fire-and-forget,
 * like `utils/analytics.ts`); each sender throws on failure so `sendTest` can
 * surface the real error, while `send` swallows failures per provider.
 *
 * Telegram and ntfy send one rich card per new job (capped, then a "+N more"
 * follow-up); the webhook receives all new jobs in a single JSON POST.
 */

// A flattened, display-ready view of a job used by every provider.
export type NotificationJob = {
  id: string
  title: string
  url: string
  type: string
  budget: string | null
  engagement: string | null
  tier: string | null
  duration: string | null
  // Relative time for chat providers (Telegram/ntfy); absolute ISO for
  // automation consumers (webhook).
  postedAgo: string
  postedAt: string | null
  skills: string[]
  proposalsTier: string | null
  description: string
  client: {
    rating: number | null
    country: string | null
    totalSpent: number | null
    paymentVerified: boolean
  } | null
}

export type NotificationPayload = {
  count: number
  jobs: Job[]
}

// How many detailed cards to send before collapsing the rest into "+N more".
const MAX_CARDS = 5
const DESCRIPTION_LIMIT = 350
const FEED_URL = 'https://www.upwork.com/nx/find-work/'
const REQUEST_TIMEOUT_MS = 10000

/**
 * fetch that aborts if a provider stalls, so a hung request can't leave the
 * background send hanging indefinitely. Rejects with an AbortError on timeout.
 */
const timedFetch = (url: string, options: RequestInit): Promise<Response> =>
  fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

const capitalizeFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Decode the handful of HTML entities Upwork puts in titles/descriptions. */
const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')

/**
 * Turn Upwork HTML (titles, descriptions) into clean plain text. Null-safe:
 * real feed jobs can miss fields the sample job always has, and a throw here
 * would take down the whole send.
 */
const toPlainText = (html: string | null | undefined) =>
  decodeEntities((html ?? '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

const truncate = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value

const toIsoDate = (value: Date | string | null): string | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const usd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

const formatBudget = (job: Job): string | null => {
  if (job.type === 'Hourly') {
    const min = job.hourlyBudget?.min
    const max = job.hourlyBudget?.max
    if (min && max && min !== max) return `$${min}–$${max}/hr`
    if (min) return `$${min}/hr`
    return null
  }

  const amount = Number(job.amount?.amount)
  return amount > 0 ? `$${amount}` : null
}

/** Flatten a raw Job into the display model every provider renders from. */
const toView = (job: Job): NotificationJob => ({
  id: job.ciphertext,
  title: toPlainText(job.title),
  url: upworkApi.viewUrl(job.ciphertext),
  type: job.type,
  budget: formatBudget(job),
  engagement:
    job.engagement && job.engagement !== 'not_sure' ? job.engagement : null,
  tier: job.tierText ? capitalizeFirst(job.tierText) : null,
  duration:
    job.type === 'Hourly' && job.durationLabel
      ? capitalizeFirst(job.durationLabel)
      : null,
  postedAgo: moment(job.renewedOn ?? job.createdOn).fromNow(),
  postedAt: toIsoDate(job.renewedOn ?? job.createdOn),
  skills: (job.attrs ?? [])
    .map((attr) => attr.prettyName)
    .filter((name): name is string => Boolean(name))
    .slice(0, 10),
  proposalsTier: job.proposalsTier,
  description: truncate(toPlainText(job.description), DESCRIPTION_LIMIT),
  client: job.client
    ? {
        rating: job.client.totalFeedback ?? null,
        country: job.client.location?.country ?? null,
        totalSpent: job.client.totalSpent ?? null,
        paymentVerified: job.client.paymentVerificationStatus === 1,
      }
    : null,
})

const metaLine = (view: NotificationJob) =>
  [view.type, view.budget, view.engagement, view.tier, view.duration]
    .filter(Boolean)
    .join(' • ')

const clientLine = (view: NotificationJob): string | null => {
  if (!view.client) return null

  return [
    view.client.rating != null ? `⭐ ${view.client.rating.toFixed(1)}` : null,
    view.client.country,
    view.client.totalSpent ? `💰 ${usd(view.client.totalSpent)} spent` : null,
    view.client.paymentVerified ? '✅ Payment verified' : '⚠️ Unverified',
  ]
    .filter(Boolean)
    .join(' • ')
}

// ── Telegram ────────────────────────────────────────────────────────────────

const telegramCard = (view: NotificationJob): string => {
  const parts = [
    `<a href="${escapeHtml(view.url)}"><b>${escapeHtml(view.title)}</b></a>`,
  ]

  const meta = metaLine(view)
  if (meta) parts.push(escapeHtml(meta))

  if (view.skills.length) {
    parts.push(`<b>Skills:</b> ${escapeHtml(view.skills.join(' • '))}`)
  }

  const client = clientLine(view)
  if (client) parts.push(`<b>Client:</b> ${escapeHtml(client)}`)

  if (view.proposalsTier) {
    parts.push(`<b>Proposals:</b> ${escapeHtml(view.proposalsTier)}`)
  }

  if (view.description) {
    parts.push(
      `<blockquote expandable>${escapeHtml(view.description)}</blockquote>`
    )
  }

  parts.push(`<i>🕐 ${escapeHtml(view.postedAgo)}</i>`)

  return parts.join('\n\n')
}

const postTelegram = async (
  telegram: MobileNotificationsConfig['telegram'],
  text: string
): Promise<void> => {
  const botToken = telegram.botToken.trim()
  const chatId = telegram.chatId.trim()

  const response = await timedFetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    }
  )

  const body = await response.json().catch(() => null)

  if (!response.ok || (body && body.ok === false)) {
    throw new Error(
      `Telegram error: ${body?.description || `HTTP ${response.status}`}`
    )
  }
}

const sendTelegram = async (
  telegram: MobileNotificationsConfig['telegram'],
  views: NotificationJob[],
  extra: number
): Promise<void> => {
  if (!telegram.botToken.trim() || !telegram.chatId.trim()) {
    throw new Error('Telegram bot token and chat ID are required')
  }

  for (const view of views) {
    await postTelegram(telegram, telegramCard(view))
  }

  if (extra > 0) {
    await postTelegram(
      telegram,
      `➕ <b>${extra}</b> more new job${extra > 1 ? 's' : ''} — <a href="${FEED_URL}">open your feed</a>`
    )
  }
}

// ── ntfy ──────────────────────────────────────────────────────────────────────

const ntfyBody = (view: NotificationJob): string => {
  const parts: string[] = []

  const meta = metaLine(view)
  if (meta) parts.push(meta)

  if (view.skills.length) parts.push(`Skills: ${view.skills.join(' • ')}`)

  const client = clientLine(view)
  if (client) parts.push(`Client: ${client}`)

  if (view.proposalsTier) parts.push(`Proposals: ${view.proposalsTier}`)

  if (view.description) parts.push(view.description)

  parts.push(`🕐 ${view.postedAgo}`)

  return parts.join('\n\n')
}

const postNtfy = async (
  serverUrl: string,
  payload: Record<string, unknown>
): Promise<void> => {
  const response = await timedFetch(serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // High priority so ntfy shows a heads-up banner + sound instead of a
    // silent entry in the shade (default priority has no banner).
    body: JSON.stringify({ priority: 4, tags: ['briefcase'], ...payload }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`ntfy error: ${details || `HTTP ${response.status}`}`)
  }
}

const sendNtfy = async (
  ntfy: MobileNotificationsConfig['ntfy'],
  views: NotificationJob[],
  extra: number
): Promise<void> => {
  const topic = ntfy.topic.trim()
  const serverUrl = ntfy.serverUrl.trim().replace(/\/+$/, '')

  if (!serverUrl || !topic) {
    throw new Error('ntfy server URL and topic are required')
  }

  for (const view of views) {
    await postNtfy(serverUrl, {
      topic,
      title: view.title,
      message: ntfyBody(view),
      click: view.url,
    })
  }

  if (extra > 0) {
    await postNtfy(serverUrl, {
      topic,
      title: `➕ ${extra} more new job${extra > 1 ? 's' : ''}`,
      message: 'Open your Upwork feed to see the rest.',
      click: FEED_URL,
    })
  }
}

// ── Webhook ───────────────────────────────────────────────────────────────────

const sendWebhook = async (
  webhook: MobileNotificationsConfig['webhook'],
  count: number,
  views: NotificationJob[]
): Promise<void> => {
  const url = webhook.url.trim()

  if (!url) {
    throw new Error('Webhook URL is required')
  }

  const response = await timedFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'new_jobs', count, jobs: views }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Webhook error: ${details || `HTTP ${response.status}`}`)
  }
}

/**
 * Dispatch a notification to every enabled provider. Fire-and-forget: a failing
 * provider is logged and never breaks the others or the desktop notification.
 */
const send = async (payload: NotificationPayload): Promise<void> => {
  if (payload.count <= 0 || payload.jobs.length === 0) return

  const config = await mobileNotificationsStorage.get()
  const hasEnabledProvider =
    config.telegram.enabled || config.ntfy.enabled || config.webhook.enabled

  if (!hasEnabledProvider) return

  const views = payload.jobs.map(toView)
  const shown = views.slice(0, MAX_CARDS)
  const extra = Math.max(payload.count - shown.length, 0)

  const run = (provider: MobileProvider, task: () => Promise<void>) =>
    task()
      .then(() =>
        logger.info([
          'mobile_notifications',
          provider,
          `sent ${payload.count} job${payload.count > 1 ? 's' : ''}`,
        ])
      )
      .catch((error: any) =>
        logger.warn([
          'mobile_notifications',
          provider,
          'failed:',
          error?.message ?? String(error),
        ])
      )

  const tasks: Promise<void>[] = []

  if (config.telegram.enabled) {
    tasks.push(
      run('telegram', () => sendTelegram(config.telegram, shown, extra))
    )
  }
  if (config.ntfy.enabled) {
    tasks.push(run('ntfy', () => sendNtfy(config.ntfy, shown, extra)))
  }
  if (config.webhook.enabled) {
    tasks.push(
      run('webhook', () => sendWebhook(config.webhook, payload.count, views))
    )
  }

  await Promise.all(tasks)
}

// A representative job used by the settings-page "Send test" buttons.
const SAMPLE_JOB: Job = {
  title: 'Senior React Developer for Analytics Dashboard',
  type: 'Hourly',
  tierText: 'intermediate',
  description:
    'We are looking for an experienced React developer to build a real-time analytics dashboard with charts, filtering, and CSV export. Long-term collaboration preferred.',
  engagement: 'Less than 30 hrs/week',
  durationLabel: 'Ongoing project',
  proposalsTier: '5 to 10',
  clientRelation: null,
  amount: { amount: '0' },
  hourlyBudget: { min: 25, max: 45 },
  client: {
    paymentVerificationStatus: 1,
    totalFeedback: 4.9,
    totalSpent: 32000,
    location: { country: 'United States' },
  },
  attrs: [
    { prettyName: 'React' },
    { prettyName: 'TypeScript' },
    { prettyName: 'Node.js' },
  ],
  ciphertext: '~test',
  duration: null,
  renewedOn: null,
  createdOn: new Date().toISOString(),
  __isSeen: false,
}

/**
 * Send a sample card through a single provider. Re-throws on failure so the
 * settings UI can show the real error message.
 */
const sendTest = (
  provider: MobileProvider,
  config: MobileNotificationsConfig
): Promise<void> => {
  const views = [toView(SAMPLE_JOB)]

  switch (provider) {
    case 'telegram':
      return sendTelegram(config.telegram, views, 0)
    case 'ntfy':
      return sendNtfy(config.ntfy, views, 0)
    case 'webhook':
      return sendWebhook(config.webhook, 1, views)
  }
}

export default { send, sendTest }
