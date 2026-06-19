import { browser, defineBackground } from '#imports'
import openAiApi from '@/api/openai'
import extension, { Cycles } from '@/utils/extension'
import stateStorage, { GlobalState } from '@/utils/globalState'
import openAiApiKeyStorage from '@/utils/openAiApiKey'
import runtime, { GenerateCoverLetterResponse } from '@/utils/runtime'
import { captureException } from '@/utils/sentry'
import dailyReport from './dailyReport'
import fetchJobs from './fetchJobs'

const ENABLED_SCRIPTS: {
  cycleName: Cycles
  delayInMinutes: number
  periodInMinutes: number
}[] = [
  {
    cycleName: extension.Cycles.FETCH_JOBS,
    delayInMinutes: extension.debugEnabled ? 5 / 60 : 0, // 5 seconds in dev
    periodInMinutes: 1,
  },
  {
    cycleName: extension.Cycles.DAILY_REPORT,
    delayInMinutes: 10 / 60, // 10 seconds
    periodInMinutes: 60 * 24, // every day
  },
]

const enableScripts = async () => {
  const alarms = await browser.alarms.getAll()
  const alarmNames = alarms.map((alarm) => alarm.name)

  await Promise.all(
    ENABLED_SCRIPTS.map(async (script) => {
      if (!alarmNames.includes(script.cycleName)) {
        await browser.alarms.create(script.cycleName, {
          delayInMinutes: script.delayInMinutes,
          periodInMinutes: script.periodInMinutes,
        })
      }
    })
  )
}

export default defineBackground({
  type: 'module',
  main() {
    browser.action.onClicked.addListener(async () => {
      try {
        await browser.tabs.create({ url: 'options.html' })
      } catch (error) {
        captureException(error)
      }
    })

    browser.notifications.onClicked.addListener(async () => {
      try {
        if (await browser.windows.getCurrent()) {
          await browser.tabs.create({
            active: true,
            url: 'options.html',
          })
        } else {
          await browser.windows.create({
            focused: true,
            url: 'options.html',
          })
        }
      } catch {
        await browser.windows.create({
          focused: true,
          url: 'options.html',
        })
      }
    })

    browser.alarms.onAlarm.addListener(async (alarm) => {
      try {
        switch (alarm.name) {
          case extension.Cycles.FETCH_JOBS:
            return await fetchJobs()
          case extension.Cycles.DAILY_REPORT:
            return await dailyReport()
        }
      } catch (error) {
        captureException(error)
      }
    })

    browser.runtime.onInstalled.addListener(async (details) => {
      try {
        if (
          details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
          details.reason === chrome.runtime.OnInstalledReason.UPDATE
        ) {
          await enableScripts()
        }

        if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
          // Erase outdated storage keys on update
          await stateStorage.save((previousState) =>
            Object.entries(stateStorage.getDefaultState()).reduce(
              (acc, [key, defaultValue]) => ({
                ...acc,
                [key]: previousState[key as keyof GlobalState] ?? defaultValue,
              }),
              { ...stateStorage.getDefaultState(), lastCycleError: null }
            )
          )
        }
      } catch (error) {
        captureException(error)
      }
    })

    browser.idle.onStateChanged.addListener(async (state) => {
      try {
        if (state === 'active') {
          await enableScripts()
        }
      } catch (error) {
        captureException(error)
      }
    })

    browser.runtime.onStartup.addListener(async () => {
      try {
        await enableScripts()
      } catch (error) {
        captureException(error)
      }
    })

    browser.runtime.onMessage.addListener((message) => {
      if (runtime.isOpenPageMessage(message)) {
        const process = async () => {
          const currentWindow = await browser.windows.getLastFocused()

          try {
            await browser.tabs.create({
              url: message.url,
              active: true,
              windowId: currentWindow?.id,
            })
          } catch (error) {
            captureException(error)
          }
        }

        process()
      }
    })

    browser.runtime.onConnect.addListener((port) => {
      if (port.name !== runtime.Message.GENERATE_COVER_LETTER) {
        return
      }

      let connected = true
      const abortController = new AbortController()

      port.onDisconnect.addListener(() => {
        connected = false
        abortController.abort()
      })

      const post = (response: GenerateCoverLetterResponse) => {
        if (connected) {
          port.postMessage(response)
        }
      }

      port.onMessage.addListener(async (message) => {
        if (!runtime.isGenerateCoverLetterMessage(message)) {
          return
        }

        try {
          const apiKey = await openAiApiKeyStorage.get()

          if (!apiKey) {
            post({ type: 'error', error: 'NO_API_KEY' })
            return
          }

          await openAiApi.generateCoverLetter({
            apiKey,
            prompt: message.prompt,
            signal: abortController.signal,
            onChunk: (content) => post({ type: 'chunk', content }),
          })

          post({ type: 'done' })
        } catch (error) {
          // The user cancelled by closing the dialog — not an error worth reporting.
          if (abortController.signal.aborted) {
            return
          }

          captureException(error)
          post({ type: 'error', error: 'GENERATION_FAILED' })
        }
      })
    })
  },
})
