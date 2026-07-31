import { Job } from '@/api/upwork'
import { ExperienceLevel, JobFiltersConfig } from '@/utils/jobFilters'

/** Plain, lowercased text of a job for keyword matching (strips Upwork HTML). */
const jobText = (job: Job) =>
  `${job.title} ${job.description}`.replace(/<[^>]*>/g, ' ').toLowerCase()

const jobSkills = (job: Job) =>
  (job.attrs ?? [])
    .map((attr) => attr.prettyName?.toLowerCase().trim())
    .filter((name): name is string => Boolean(name))

/** Normalize the various tier strings into Entry / Intermediate / Expert. */
const normalizeTier = (tier: string | null): ExperienceLevel | null => {
  if (!tier) return null
  const value = tier.toLowerCase()
  if (value.includes('entry')) return 'Entry'
  if (value.includes('inter')) return 'Intermediate'
  if (value.includes('expert')) return 'Expert'
  return null
}

const clean = (values: string[]) =>
  values.map((value) => value.toLowerCase().trim()).filter(Boolean)

/**
 * A rule that depends on a possibly-missing job field. If the filter is
 * inactive it passes; if the field is missing, strict mode excludes it,
 * otherwise it passes.
 */
const check = (
  active: boolean,
  value: number | null | undefined,
  test: (value: number) => boolean,
  strict: boolean
): boolean => {
  if (!active) return true
  if (value == null) return !strict
  return test(value)
}

export const matchesFilters = (job: Job, config: JobFiltersConfig): boolean => {
  const strict = config.strictMode
  const text = jobText(job)

  // ── Keywords ────────────────────────────────────────────────────────────
  const include = clean(config.includeKeywords)
  if (include.length && !include.some((word) => text.includes(word))) {
    return false
  }

  const exclude = clean(config.excludeKeywords)
  if (exclude.length && exclude.some((word) => text.includes(word))) {
    return false
  }

  // ── Skills ──────────────────────────────────────────────────────────────
  const skills = jobSkills(job)

  const requireSkills = clean(config.requireSkills)
  if (requireSkills.length) {
    if (!skills.length) {
      if (strict) return false
    } else if (!requireSkills.some((skill) => skills.includes(skill))) {
      return false
    }
  }

  const excludeSkills = clean(config.excludeSkills)
  if (
    excludeSkills.length &&
    excludeSkills.some((skill) => skills.includes(skill))
  ) {
    return false
  }

  // ── Budget ──────────────────────────────────────────────────────────────
  if (config.budgetType === 'fixed' && job.type !== 'Fixed-price') return false
  if (config.budgetType === 'hourly' && job.type !== 'Hourly') return false

  if (job.type === 'Hourly') {
    const top = job.hourlyBudget?.max || job.hourlyBudget?.min || null
    const bottom = job.hourlyBudget?.min || null
    // Job's top rate must clear the minimum; its bottom rate must be under the max.
    if (
      !check(
        config.minHourly != null,
        top,
        (v) => v >= config.minHourly!,
        strict
      )
    ) {
      return false
    }
    if (
      !check(
        config.maxHourly != null,
        bottom,
        (v) => v <= config.maxHourly!,
        strict
      )
    ) {
      return false
    }
  }

  if (job.type === 'Fixed-price') {
    const amount = Number(job.amount?.amount)
    const budget = Number.isFinite(amount) && amount > 0 ? amount : null
    if (
      !check(
        config.minFixed != null,
        budget,
        (v) => v >= config.minFixed!,
        strict
      )
    ) {
      return false
    }
    if (
      !check(
        config.maxFixed != null,
        budget,
        (v) => v <= config.maxFixed!,
        strict
      )
    ) {
      return false
    }
  }

  // ── Experience ──────────────────────────────────────────────────────────
  if (config.experienceLevels.length) {
    const tier = normalizeTier(job.tierText)
    if (!tier) {
      if (strict) return false
    } else if (!config.experienceLevels.includes(tier)) {
      return false
    }
  }

  // ── Client ──────────────────────────────────────────────────────────────
  if (
    !check(
      config.minRating != null,
      job.client?.totalFeedback,
      (v) => v >= config.minRating!,
      strict
    )
  ) {
    return false
  }
  if (
    !check(
      config.minReviews != null,
      job.client?.totalReviews,
      (v) => v >= config.minReviews!,
      strict
    )
  ) {
    return false
  }
  if (
    !check(
      config.minSpent != null,
      job.client?.totalSpent,
      (v) => v >= config.minSpent!,
      strict
    )
  ) {
    return false
  }
  if (
    !check(
      config.maxSpent != null,
      job.client?.totalSpent,
      (v) => v <= config.maxSpent!,
      strict
    )
  ) {
    return false
  }
  if (
    !check(
      config.minHires != null,
      job.client?.totalHires,
      (v) => v >= config.minHires!,
      strict
    )
  ) {
    return false
  }

  if (config.paymentVerifiedOnly) {
    const status = job.client?.paymentVerificationStatus
    if (status == null) {
      if (strict) return false
    } else if (status !== 1) {
      return false
    }
  }

  const excludeCountries = clean(config.excludeCountries)
  if (excludeCountries.length) {
    const country = job.client?.location?.country?.toLowerCase().trim()
    if (!country) {
      if (strict) return false
    } else if (excludeCountries.includes(country)) {
      return false
    }
  }

  if (config.repeatClientsOnly && !job.clientRelation) return false

  if (config.excludeApplied && job.isApplied) return false

  return true
}

/** Filter a list of jobs when filtering is enabled; otherwise return as-is. */
export const filterJobs = <T extends Job>(
  jobs: T[],
  config: JobFiltersConfig | null | undefined
): T[] =>
  config?.enabled ? jobs.filter((job) => matchesFilters(job, config)) : jobs
