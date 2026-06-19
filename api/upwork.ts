import { browser, type Browser } from '#imports'
import { ErrorType } from '@/utils/errors'
import logger from '@/utils/logger'
import { captureException } from '@/utils/sentry'
import timer from '@/utils/timer'
import axios, { AxiosResponse } from 'axios'
import isString from 'lodash/isString'

import {
  bestMatchesQuery,
  mostRecentQuery,
  myFeedQuery,
  userQuery,
} from './gqlQueries'

import { BestMatches as BestMatchesResponseType } from './responses/BestMatches'
import { MostRecent as MostRecentResponseType } from './responses/MostRecent'
import { MyFeed } from './responses/MyFeed'

type MyFeedErrorResponse = {
  data: {
    userSavedSearches: null
  }
}

type MyFeedResponseType = MyFeed | MyFeedErrorResponse

export type Job = {
  title: string
  type: string
  tierText: string | null
  description: string
  engagement: string | null
  durationLabel: string | null
  proposalsTier: string | null
  clientRelation: null | string

  amount: {
    amount: string
  }

  hourlyBudget: {
    min: number
    max: number
  }

  client?: {
    paymentVerificationStatus: number | null
    totalFeedback: number
    totalSpent: number

    location?: {
      country: string | null
    }
  }
  attrs?: {
    prettyName: string | null
  }[]

  /**
   * Unique identifier
   */
  ciphertext: string
  duration: string | null
  renewedOn: Date | null
  createdOn: Date | string

  // internal attribute
  __isSeen: boolean
}

const api = axios.create({
  adapter: 'fetch',
  withCredentials: true,
  baseURL: 'https://www.upwork.com',
})

api.interceptors.response.use(logger.logRequest)

const pageHeaders = {
  'Cache-Control': 'no-cache',
  Accept: [
    'text/html',
    'application/xhtml+xml',
    'application/xml;q=0.9',
    'image/avif',
    'image/webp',
    'image/apng',
    '*/*;q=0.8',
    'application/signed-exchange;v=b3;q=0.9',
  ].join(', '),
  'Accept-Encoding': ['gzip', 'deflate', 'br'].join(', '),
  'X-Requested-With': 'XMLHttpRequest',
}

export enum FeedType {
  MostRecent = 'Most Recent',
  BestMatches = 'Best Matches',
  MyFeed = 'My Feed / Saved Searches',
}

type FeedOptions = Record<
  FeedType,
  {
    pageUrl: string
    description: string
    query?: string
  }
>

const feedOptions: FeedOptions = {
  [FeedType.MyFeed]: {
    pageUrl: 'https://www.upwork.com/nx/find-work',
    description:
      'Jobs that match your personal preferences/filters <strong>(configurable)</strong>.',
    query: myFeedQuery,
  },
  [FeedType.BestMatches]: {
    pageUrl: 'https://www.upwork.com/nx/find-work/best-matches',
    description:
      "Jobs that match your experience to a client's hiring preferences <strong>(not configurable)</strong>. Ordered by most relevant.",
    query: bestMatchesQuery,
  },
  [FeedType.MostRecent]: {
    pageUrl: 'https://www.upwork.com/nx/find-work/most-recent',
    description:
      'The most recent jobs that match your skills and profile description to the skills clients are looking for <strong>(not configurable)</strong>.',
    query: mostRecentQuery,
  },
}

const getCookieToken = async (props: {
  path: string
  shouldTryAgain?: boolean
  triggerCookieToken: () => Promise<AxiosResponse>
}): Promise<Browser.cookies.Cookie | null> => {
  const { shouldTryAgain = true, triggerCookieToken, path } = props

  const cookies = await browser.cookies.getAll({ path })

  const cookie = cookies.length
    ? cookies.reduce(
        (result: Browser.cookies.Cookie, current: Browser.cookies.Cookie) =>
          (current.expirationDate as number) > (result.expirationDate as number)
            ? current
            : result
      )
    : null

  if (
    cookie &&
    cookie.expirationDate &&
    cookie.expirationDate * 1000 > Date.now()
  ) {
    return cookie
  }

  if (!shouldTryAgain) {
    return null
  }

  await removeCookies(props.path)
  await triggerCookieToken()
  await timer.resolveIn(5000)

  const triggerResponse = await triggerCookieToken()
  if (
    isString(triggerResponse.data.action) &&
    triggerResponse.data.action.startsWith(
      'https://www.upwork.com/ab/account-security/login'
    )
  ) {
    return null
  }

  return getCookieToken({ ...props, shouldTryAgain: false })
}

const getJobsToken = () =>
  getCookieToken({
    path: '/nx/find-work/',
    triggerCookieToken: () =>
      api.get('nx/find-work/', { headers: pageHeaders }),
  })

const removeCookies = async (path: string) => {
  const cookies = await browser.cookies.getAll({ path })

  await Promise.all(
    cookies.map((c) =>
      browser.cookies.remove({
        name: c.name,
        url: `https://upwork.com${c.path}`,
      })
    )
  )
}

const requestJobs = async (
  cookie: Browser.cookies.Cookie,
  feedType: FeedType
): Promise<Job[]> => {
  const headers = {
    Authorization: cookie ? `bearer ${cookie.value}` : false,
    'X-Requested-With':
      feedType === FeedType.MostRecent ? 'XMLHttpRequest' : false,
  }

  if (feedType === FeedType.MyFeed) {
    const response = await api.post<MyFeedResponseType | MyFeedErrorResponse>(
      'api/graphql/v1',
      {
        query: feedOptions[FeedType.MyFeed].query,
        variables: { queryParams: {} },
      },
      { headers }
    )

    if (!response.data?.data?.userSavedSearches) {
      captureException(new Error('response.data.data is undefined'), {
        data: { response },
      })
      return []
    }

    return response.data.data.userSavedSearches.results.map((job) => ({
      ...job,
      __isSeen: false,
      tierText: job.contractorTier,
      type: job.type === 'FIXED' ? 'Fixed-price' : 'Hourly',
      client: {
        ...job.client,
        totalSpent: Number.parseFloat(
          job.client.totalSpent ? job.client.totalSpent.displayValue : ''
        ),
      },
    }))
  }

  if (feedType === FeedType.BestMatches) {
    const response = await api.post<BestMatchesResponseType>(
      'api/graphql/v1',
      {
        query: feedOptions[FeedType.BestMatches].query,
        variables: { fromTime: 0, toTime: 30 },
      },
      { headers }
    )

    if (!response.data?.data?.bestMatchJobsFeed) {
      captureException(new Error('response.data.data is undefined'), {
        data: { response },
      })
      return []
    }

    return response.data.data.bestMatchJobsFeed.results.map((job) => ({
      ...job,
      __isSeen: false,
      type: job.type === 1 ? 'Fixed-price' : 'Hourly',
      amount: {
        ...job.amount,
        amount: String(job.amount.amount),
      },
    }))
  }

  if (feedType === FeedType.MostRecent) {
    const response = await api.post<MostRecentResponseType>(
      'api/graphql/v1',
      {
        query: feedOptions[FeedType.MostRecent].query,
        variables: { limit: 10 },
      },
      { headers }
    )

    if (!response.data?.data?.mostRecentJobsFeed) {
      captureException(new Error('response.data.data is undefined'), {
        data: { response },
      })
      return []
    }

    return response.data.data.mostRecentJobsFeed.results.map((job) => ({
      ...job,
      __isSeen: false,
      durationLabel: job.duration,
      clientRelation: null,
      renewedOn: job.publishedOn,
      type: job.type === 1 ? 'Fixed-price' : 'Hourly',
      amount: {
        ...job.amount,
        amount: String(job.amount.amount),
      },
    }))
  }

  throw new Error('Invalid feed type')
}

const getJobs = async (feedType: FeedType) => {
  const cookie = await getJobsToken()

  if (!cookie) {
    throw new Error(ErrorType.UNAUTHENTICATED)
  }

  try {
    return await requestJobs(cookie, feedType)
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      await removeCookies('/nx/find-work/')
      const newCookie = await getJobsToken()

      if (!newCookie) {
        throw new Error(ErrorType.UNAUTHENTICATED)
      }

      return await requestJobs(newCookie, feedType)
    } else {
      throw error
    }
  }
}

const viewUrl = (id: string) => `https://upwork.com/jobs/${id}`

const proposalUrl = (id: string) =>
  `https://upwork.com/ab/proposals/job/${id}/apply`

const getUsernameToken = () =>
  getCookieToken({
    path: '/freelancers/settings/',
    triggerCookieToken: () =>
      api.get('/freelancers/settings/contactInfo', { headers: pageHeaders }),
  })

const getUsername = async (): Promise<string | null> => {
  const cookie = await getUsernameToken()

  if (!cookie) {
    throw new Error(ErrorType.UNAUTHENTICATED)
  }

  type UserResponse = {
    data: {
      user: {
        id: string | null
        rid: string | null
        nid: string | null
      }
    }
  }

  const response = await api.post<UserResponse>(
    'api/graphql/v1',
    {
      query: userQuery,
      variables: { queryParams: {} },
    },
    { headers: { Authorization: `bearer ${cookie.value}` } }
  )

  return response.data.data.user.nid
}

const isUnauthenticatedError = (error: any) =>
  (axios.isAxiosError(error) && error.response?.status === 401) ||
  error?.message === ErrorType.UNAUTHENTICATED

const isForbiddenError = (error: any) =>
  axios.isAxiosError(error) && error.response?.status === 403

const isNetworkError = (error: any) =>
  axios.isAxiosError(error) && error.code === 'ERR_NETWORK'

const isServerError = (error: any) =>
  axios.isAxiosError(error) && error.response && error.response.status >= 500

const isRateLimitError = (error: any) =>
  axios.isAxiosError(error) && error.response && error.response.status === 429

const shouldIgnoreError = (error: any) =>
  axios.isAxiosError(error) &&
  error.response &&
  [400, 409, 499].includes(error.response.status)

export default {
  getJobs,
  getJobsToken,
  getUsername,
  getUsernameToken,
  feedOptions,
  isUnauthenticatedError,
  isForbiddenError,
  isNetworkError,
  isRateLimitError,
  isServerError,
  proposalUrl,
  shouldIgnoreError,
  viewUrl,
}
