/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WXT_GA_API_SECRET: string
  readonly WXT_GA_MEASUREMENT_ID: string
  readonly WXT_SENTRY_DSN: string
  readonly SENTRY_AUTH_TOKEN: string
  readonly SENTRY_ORGANISATION: string
  readonly SENTRY_PROJECT: string
  readonly WXT_GITHUB_URL: string
  readonly WXT_X_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
