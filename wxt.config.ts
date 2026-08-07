import { defineConfig } from 'wxt'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import {
  optionalHostPermissions,
  staticHostPermissions,
} from './utils/aiCatalog'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: ({ manifestVersion }) => ({
    name: 'Upwork toolkit - your own freelance assistant',
    description: 'Save time and earn more with Upwork toolkit.',
    action: {
      default_icon: 'icon/32.png',
    },
    permissions: [
      'idle',
      'alarms',
      'storage',
      'cookies',
      'offscreen',
      'notifications',
      'declarativeNetRequest',
    ],
    host_permissions: ['https://*.upwork.com/', ...staticHostPermissions],
    // WXT drops `optional_host_permissions` from MV2 builds without converting
    // it, which would leave Firefox unable to request any provider origin.
    ...(manifestVersion === 3
      ? { optional_host_permissions: optionalHostPermissions }
      : { optional_permissions: optionalHostPermissions }),
    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_1',
          enabled: true,
          path: 'request_modifier.json',
        },
      ],
    },
  }),
  imports: false,
  modules: ['@wxt-dev/module-react'],
  outDir: 'build',
  webExt: {
    disabled: true,
  },
  vite: () => ({
    plugins: [
      sentryVitePlugin({
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
        debug: import.meta.env.DEV,
        org: import.meta.env.SENTRY_ORGANISATION,
        project: import.meta.env.SENTRY_PROJECT,
        telemetry: false,
      }),
    ],
    build: {
      chunkSizeWarningLimit: 10000,
      sourcemap: true,
    },
  }),
  zip: {
    exclude: ['**/*.js.map'],
  },
})
