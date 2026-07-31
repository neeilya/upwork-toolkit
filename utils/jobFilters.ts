import { storage } from '#imports'
import isFunction from 'lodash/isFunction'

const namespace = 'sync:__JOB_FILTERS'

export type BudgetType = 'any' | 'fixed' | 'hourly'

export const EXPERIENCE_LEVELS = ['Entry', 'Intermediate', 'Expert'] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

/**
 * A single, global set of advanced filters applied to the fetched Upwork feed.
 * Persisted in cloud storage (synced across the user's Chrome).
 */
export type JobFiltersConfig = {
  enabled: boolean
  // When a job is missing data for an active filter: strict → exclude it,
  // lenient (default) → let it through.
  strictMode: boolean

  includeKeywords: string[] // job must contain ANY of these (title + description)
  excludeKeywords: string[] // reject if ANY of these appears

  requireSkills: string[] // job skills must include ≥1 of these
  excludeSkills: string[] // reject if job has any of these skills

  budgetType: BudgetType
  minHourly: number | null
  maxHourly: number | null
  minFixed: number | null
  maxFixed: number | null

  experienceLevels: ExperienceLevel[] // empty = any

  minRating: number | null // client rating (0–5)
  minReviews: number | null
  minSpent: number | null
  maxSpent: number | null
  minHires: number | null
  paymentVerifiedOnly: boolean
  excludeCountries: string[] // reject clients from these countries
  repeatClientsOnly: boolean // only jobs from clients you've worked with

  excludeApplied: boolean // hide jobs you've already applied to
}

export const getDefaultConfig = (): JobFiltersConfig => ({
  enabled: false,
  strictMode: false,

  includeKeywords: [],
  excludeKeywords: [],

  requireSkills: [],
  excludeSkills: [],

  budgetType: 'any',
  minHourly: null,
  maxHourly: null,
  minFixed: null,
  maxFixed: null,

  experienceLevels: [],

  minRating: null,
  minReviews: null,
  minSpent: null,
  maxSpent: null,
  minHires: null,
  paymentVerifiedOnly: false,
  excludeCountries: [],
  repeatClientsOnly: false,

  excludeApplied: false,
})

const get = () =>
  storage.getItem<JobFiltersConfig>(namespace, { fallback: getDefaultConfig() })

const save = async (
  arg:
    Partial<JobFiltersConfig> | ((prev: JobFiltersConfig) => JobFiltersConfig)
): Promise<JobFiltersConfig> => {
  // Shallow merge: array fields are replaced wholesale (not merged by index).
  const updated = isFunction(arg)
    ? arg(await get())
    : { ...(await get()), ...arg }

  await storage.setItem<JobFiltersConfig>(namespace, updated)
  return updated
}

const addEventListener = (
  callback: (
    newValue: JobFiltersConfig | null,
    oldValue: JobFiltersConfig | null
  ) => void
) => storage.watch<JobFiltersConfig>(namespace, callback)

export default { get, save, addEventListener, getDefaultConfig }
