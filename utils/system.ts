export const darkMode =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const isMac = () => navigator.platform.toLowerCase().includes('mac')

export const helperKey = isMac() ? 'CMD' : 'CTRL'
