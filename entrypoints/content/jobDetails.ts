import { captureException } from '@/utils/sentry'
import timer from '@/utils/timer'
import type { PageJobDetails } from '@/utils/events'

export type { PageJobDetails }

const ROOT_SELECTOR = '.fe-job-details'
const TITLE_SELECTOR = 'h3'
const DESCRIPTION_SELECTOR = '.description'
const TRUNCATION_LABELS_SELECTOR = '.air3-truncation-labels'

const waitForJobDetails = async (): Promise<Element | null> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    const root = document.querySelector(ROOT_SELECTOR)

    if (
      root?.querySelector(TITLE_SELECTOR) &&
      root.querySelector(DESCRIPTION_SELECTOR)
    ) {
      return root
    }

    await timer.resolveIn(500)
  }

  return null
}

/**
 * Upwork renders the job description inside an `air3-truncation` component that
 * only shows a shortened string until its "more" toggle is clicked. Expanding
 * it puts the full text into the DOM so it can be read.
 */
const expandDescription = (root: Element): void => {
  const labels = root.querySelector(
    `${DESCRIPTION_SELECTOR} ${TRUNCATION_LABELS_SELECTOR}`
  )

  if (!labels) {
    return
  }

  const toggle =
    labels.querySelector<HTMLElement>('button, a, [role="button"]') ??
    Array.from(labels.querySelectorAll<HTMLElement>('*')).find((element) =>
      /more/i.test(element.textContent ?? '')
    )

  toggle?.click()
}

const readDescription = (root: Element): string => {
  const description = root.querySelector(DESCRIPTION_SELECTOR)

  if (!description) {
    return ''
  }

  // Strip the "more / less" toggle labels from the cloned node before reading.
  const clone = description.cloneNode(true) as Element
  clone
    .querySelectorAll(TRUNCATION_LABELS_SELECTOR)
    .forEach((element) => element.remove())

  return (clone.textContent ?? '').trim()
}

/**
 * Reads the description, polling until the text stops changing (or a timeout)
 * so a slow truncation expansion doesn't yield a partial description.
 */
const readExpandedDescription = async (root: Element): Promise<string> => {
  let previous = ''

  for (let attempt = 0; attempt < 10; attempt++) {
    const current = readDescription(root)

    if (current && current === previous) {
      return current
    }

    previous = current
    await timer.resolveIn(100)
  }

  return previous
}

/**
 * Reads the job title and full description straight from the proposal page DOM.
 * Upwork removed the REST endpoint this used to come from, so the rendered page
 * is now the source of truth.
 */
const getJobDetailsFromPage = async (): Promise<PageJobDetails | null> => {
  try {
    const root = await waitForJobDetails()

    if (!root) {
      return null
    }

    expandDescription(root)

    const title = (root.querySelector(TITLE_SELECTOR)?.textContent ?? '').trim()
    const description = await readExpandedDescription(root)

    if (!title || !description) {
      return null
    }

    return { title, description }
  } catch (error) {
    captureException(error)
    return null
  }
}

export default { getJobDetailsFromPage }
