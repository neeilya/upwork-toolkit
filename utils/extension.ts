import packageJson from '@/package.json'

const debugEnabled = import.meta.env.MODE === 'development'
const version = packageJson.version

export enum Cycles {
  FETCH_JOBS = 'FETCH_JOBS',
  DAILY_REPORT = 'DAILY_REPORT',
}

export default {
  Cycles,
  debugEnabled,
  version,
}
