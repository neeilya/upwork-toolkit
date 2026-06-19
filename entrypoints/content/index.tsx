import { createShadowRootUi, defineContentScript } from '#imports'
import AppProvider from '@/components/AppProvider'
import StorageProvider from '@/components/StorageProvider'
import coverLetterStorage from '@/utils/coverLetter'
import { eventEmitter } from '@/utils/events'
import { captureException } from '@/utils/sentry'
import ReactDOM from 'react-dom/client'
import App from './App'
import GenerateButton from './GenerateButton'

export default defineContentScript({
  allFrames: true,
  runAt: 'document_end',
  registration: 'manifest',
  matches: ['https://*.upwork.com/nx/proposals/job/*/apply*'],
  async main(ctx) {
    const waitForTextarea = (): Promise<HTMLTextAreaElement> =>
      new Promise((resolve, reject) => {
        let attempts = 10

        const interval: NodeJS.Timeout = setInterval(() => {
          if (attempts === 0) {
            return reject(
              new Error('Could not find cover letter textarea element')
            )
          }

          const textarea = document.querySelector(
            'textarea[aria-labelledby="cover_letter_label"]'
          ) as HTMLTextAreaElement | null

          if (textarea) {
            clearInterval(interval)
            resolve(textarea)
          }

          --attempts
        }, 500)
      })

    window.onload = async () => {
      let textarea: HTMLTextAreaElement | null = null

      try {
        textarea = await waitForTextarea()
      } catch (error) {
        captureException(error, {
          data: { pathname: window.location.pathname },
        })
        return
      }

      try {
        const template = await coverLetterStorage.get()
        textarea.value = template
        textarea.dispatchEvent(new InputEvent('input'))
      } catch (error) {
        captureException(error)
      }

      try {
        const ROOT_CONTAINER_ID = 'upwork-toolkit-root-container'
        const BUTTON_CONTAINER_ID = 'upwork-toolkit-button-container'

        const parent = document.querySelector(
          '.cover-letter-area'
        ) as HTMLDivElement | null

        if (!parent) {
          return
        }

        const dialogUiPromise = createShadowRootUi(ctx, {
          name: 'dialog-container',
          anchor: 'body',
          position: 'inline',
          onMount: () => {
            const rootContainer = document.createElement('div')
            rootContainer.id = ROOT_CONTAINER_ID
            document.body.appendChild(rootContainer)

            const rootDom = ReactDOM.createRoot(
              document.getElementById(ROOT_CONTAINER_ID) as HTMLElement
            )

            rootDom.render(
              <StorageProvider>
                <AppProvider disableDarkMode scopedCssBaseline>
                  <App
                    eventEmitter={eventEmitter}
                    onInsert={(template) => {
                      textarea.value = template
                      textarea.dispatchEvent(new InputEvent('input'))
                    }}
                  />
                </AppProvider>
              </StorageProvider>
            )

            return rootDom
          },
          onRemove: (root) => {
            root?.unmount()
          },
        })

        const buttonUiPromise = createShadowRootUi(ctx, {
          name: 'button-container',
          anchor: parent,
          position: 'overlay',
          alignment: 'bottom-right',
          onMount: () => {
            const buttonContainer = document.createElement('div')
            buttonContainer.id = BUTTON_CONTAINER_ID
            parent.appendChild(buttonContainer)

            const buttonDom = ReactDOM.createRoot(
              document.getElementById(BUTTON_CONTAINER_ID) as HTMLElement
            )

            buttonDom.render(
              <StorageProvider>
                <AppProvider disableDarkMode scopedCssBaseline>
                  <GenerateButton eventEmitter={eventEmitter} />
                </AppProvider>
              </StorageProvider>
            )
            return buttonDom
          },
          onRemove: (root) => {
            root?.unmount()
          },
        })

        const [dialogUi, buttonUi] = await Promise.all([
          dialogUiPromise,
          buttonUiPromise,
        ])

        dialogUi.mount()
        buttonUi.mount()
      } catch (error) {
        captureException(error)
      }
    }
  },
})
