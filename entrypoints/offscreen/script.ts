import { browser } from '#imports'
import runtime from '@/utils/runtime'
import { captureException } from '@/utils/sentry'
import { type PublicPath } from 'wxt/browser'

browser.runtime.onMessage.addListener(async (message) => {
  try {
    if (!runtime.isPlaySoundMessage(message)) return

    const sound = new Audio(browser.runtime.getURL('sound.mp3' as PublicPath))
    sound.volume = message.volume / 100

    sound.addEventListener('ended', async () => {
      try {
        await browser.offscreen.closeDocument()
      } catch (error) {
        // Ignore error
      }
    })

    await sound.play()
  } catch (error) {
    captureException(error)
  }
})
