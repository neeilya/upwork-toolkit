import { defineConfig } from 'wxt'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
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
    host_permissions: ['https://*.upwork.com/', 'https://api.openai.com/'],
    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_1',
          enabled: true,
          path: 'request_modifier.json',
        },
      ],
    },
  },
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
