export enum Message {
  OPEN_PAGE = 'OPEN_PAGE',
  PLAY_SOUND = 'PLAY_SOUND',
  GENERATE_COVER_LETTER = 'GENERATE_COVER_LETTER',
}

export type GenerateCoverLetterMessage = {
  prompt: string
  type: Message.GENERATE_COVER_LETTER
}

/**
 * Streamed responses sent back over the GENERATE_COVER_LETTER port.
 */
export type GenerateCoverLetterResponse =
  | { type: 'chunk'; content: string }
  | { type: 'done' }
  | { type: 'error'; error: 'NO_API_KEY' | 'GENERATION_FAILED' }

export type PlaySoundMessage = {
  volume: number
  type: Message.PLAY_SOUND
}

export type OpenPageMessage = {
  url: string
  type: Message.OPEN_PAGE
}

const isPlaySoundMessage = (message: any): message is PlaySoundMessage =>
  message && !isNaN(message.volume) && message.type === Message.PLAY_SOUND

const isOpenPageMessage = (message: any): message is OpenPageMessage =>
  message && message.type === Message.OPEN_PAGE

const isGenerateCoverLetterMessage = (
  message: any
): message is GenerateCoverLetterMessage =>
  message &&
  message.type === Message.GENERATE_COVER_LETTER &&
  typeof message.prompt === 'string'

export default {
  isPlaySoundMessage,
  isOpenPageMessage,
  isGenerateCoverLetterMessage,
  Message,
}
