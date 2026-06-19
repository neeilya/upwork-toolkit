![alt tag](https://github.com/neeilya/upwork-toolkit/blob/master/cover.png?raw=true)

A browser extension that monitors your Upwork job feed in real time and notifies you the
instant new jobs appear, so you never miss an opportunity while you're away from the screen.

This is the React + TypeScript rewrite of the original Vue extension that previously lived in
this repository.

## Install

Install the ready-to-use extension from the
[Chrome Web Store](https://chrome.google.com/webstore/detail/upwork-toolkit-your-own-f/gcjmekbfkkmaccloaoccfiohjnmgkddm).

Feedback and contributions are highly appreciated!

## Note to freelancers

The extension reads items from your **personal** job feed. If you're new to the platform, that
feed may be empty at first. To personalize it, run a job search on Upwork with some criteria
(keywords, minimum budget, etc.) and **save the search** — the extension will then track matching
jobs as they appear.

More details about the job feed and other common concerns can be found in the **FAQ** section
inside the extension.

## Features

- **Real-time job monitoring** across three feeds: _My Feed / Saved Searches_, _Best Matches_,
  and _Most Recent_.
- **Desktop notifications** that are clickable, with optional **sound** and volume control, an
  **unseen-jobs badge** on the toolbar icon, and **deduplication** so you're never notified twice
  about the same job.
- **Scheduled notifications** — define working-hours windows per day of the week (12- or 24-hour
  format); jobs found outside your schedule are cached silently.
- **Cover-letter templates** — save reusable cover-letter text that auto-fills the proposal form
  when you open a job's apply page.
- **Job browsing UI** — job cards with compact/detailed toggle and dark mode (On / Off / System).
- **Settings** — master on/off switch, feed source selection, sound preferences, and an option to
  auto-open the proposal page for new jobs.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [WXT](https://wxt.dev/) — browser-extension framework (Chrome MV3)
- [Material UI 9](https://mui.com/) + [Emotion](https://emotion.sh/)
- [Axios](https://axios-http.com/), [date-fns](https://date-fns.org/)
- [Sentry](https://sentry.io/) for error tracking
- Google Analytics 4 for extension internal usage only

Node 22 is recommended (see `.nvmrc`); Node 20 is the minimum supported version.

## Getting started

Build the extension from source and load it as an unpacked extension:

```bash
# 1. Install dependencies (Node >= 20)
npm install

# 2a. Run a live-reload dev build...
npm run dev

# 2b. ...or produce a production build
npm run build
```

`npm run build` writes the extension to `build/chrome-mv3`. To load it:

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the `build/chrome-mv3` directory.

## Scripts

| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start a live-reload development build         |
| `npm run build`   | Produce a production build in `build/`        |
| `npm run zip`     | Package the build into a distributable `.zip` |
| `npm run compile` | Type-check the project (`tsc --noEmit`)       |
| `npm run format`  | Format the codebase with Prettier             |

Experimental Firefox variants (`dev:firefox`, `build:firefox`, `zip:firefox`) exist, but Chrome
MV3 is the supported target.

## Environment variables

All variables are **optional** for local development — the core job-tracking features work without
them. Copy `.env.example` to `.env` to configure them. Analytics and error reporting are simply
disabled when their variables are unset.

| Variable                | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `WXT_GA_API_SECRET`     | Google Analytics 4 API secret                         |
| `WXT_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID                     |
| `WXT_SENTRY_DSN`        | Sentry DSN for runtime error reporting                |
| `SENTRY_AUTH_TOKEN`     | Sentry auth token for source-map upload at build time |
| `SENTRY_ORGANISATION`   | Sentry organization slug                              |
| `SENTRY_PROJECT`        | Sentry project slug                                   |

## How it works

- **Authentication** — the extension uses your existing Upwork session via cookies; there's no
  separate login or OAuth flow. It calls the Upwork GraphQL API at
  `https://www.upwork.com/api/graphql/v1`.
- **Background polling** — a service worker runs on Chrome alarms, fetching jobs roughly once a
  minute (every few seconds in dev mode).
- **Sound** — notification sounds are played through an offscreen document (required for audio in
  Manifest V3 service workers).
- **Analytics** — Google Analytics is used only to understand how the extension itself is used. It
  does not track your activity on the Upwork website or anywhere else.

## Permissions

| Permission              | Why it's needed                                          |
| ----------------------- | -------------------------------------------------------- |
| `idle`                  | Detect user activity for scheduling                      |
| `alarms`                | Schedule periodic background job fetches                 |
| `storage`               | Persist settings, schedules, and cached jobs             |
| `cookies`               | Use your existing Upwork session for API requests        |
| `offscreen`             | Play notification sounds in Manifest V3                  |
| `notifications`         | Show desktop notifications for new jobs                  |
| `declarativeNetRequest` | Adjust request headers needed to call the Upwork API     |
| `https://*.upwork.com/` | Host access for reading your job feed and proposal pages |

## Project structure

```
uptoolkit/
├── entrypoints/        # Extension contexts
│   ├── background/     # Service worker (alarms, job fetching)
│   ├── content/        # Content scripts (Upwork proposal pages)
│   ├── offscreen/      # Audio playback document
│   └── options/        # Settings & dashboard UI (pages, components)
├── api/                # Upwork GraphQL API + GraphQL queries
├── utils/              # State, notifications, analytics, logging, etc.
├── components/         # Shared UI components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (storage)
├── icons/              # Icon components
└── public/             # Static assets (icons, sound, HTML)
```

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
