import { browser, type Browser, PublicPath } from 'wxt/browser'
import runtime, { PlaySoundMessage } from './runtime'
import timer from './timer'

const create = (
  options: Browser.notifications.NotificationCreateOptions
): Promise<string> =>
  new Promise((resolve, reject) =>
    browser.notifications.create(options, (notification) =>
      browser.runtime.lastError
        ? reject(browser.runtime.lastError)
        : resolve(notification)
    )
  )

const clear = (id: string): Promise<boolean> =>
  new Promise((resolve, reject) =>
    browser.notifications.clear(id, (wasCleared) =>
      browser.runtime.lastError
        ? reject(browser.runtime.lastError)
        : resolve(wasCleared)
    )
  )

const clearAll = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    browser.notifications.getAll(async (notifications) => {
      if (browser.runtime.lastError) return reject(browser.runtime.lastError)

      try {
        const ids = Object.keys(notifications)
        const requests = ids.map(clear)
        const results = await Promise.all(requests)

        resolve(results.every(Boolean))
      } catch (error) {
        reject(error)
      }
    })
  })

const playSound = async (volume: number) => {
  // Close offscreen document if there is a sound still playing
  try {
    await browser.offscreen.closeDocument()
  } catch (error) {
    // Ignore error
  }

  try {
    await browser.offscreen.createDocument({
      justification: 'Audio playback',
      url: browser.runtime.getURL('offscreen.html' as PublicPath),
      reasons: [browser.offscreen.Reason.AUDIO_PLAYBACK],
    })
  } catch (error) {
    // Ignore error
  }

  await browser.runtime.sendMessage<PlaySoundMessage>({
    volume,
    type: runtime.Message.PLAY_SOUND,
  })
}

type SoundSettings = {
  volume?: number
  enabled?: boolean
}

const show = async (
  config: Browser.notifications.NotificationCreateOptions,
  soundSettings: SoundSettings = {}
) => {
  const clearedAll = await clearAll()

  // Do not remove, otherwise new notification will not be shown
  // and instead just the old one will be updated (MacOS bug)
  await timer.resolveIn(100)

  const created = await create(config)

  soundSettings.enabled &&
    soundSettings.volume &&
    (await playSound(soundSettings.volume))

  return { created, clearedAll }
}

export default {
  create,
  clear,
  clearAll,
  playSound,
  show,
}
