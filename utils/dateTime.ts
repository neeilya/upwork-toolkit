import { format } from 'date-fns'

type Day = {
  index: number
  name: string
}

const sunday: Day = { index: 0, name: 'Sunday' }

const daysWithoutSunday: Day[] = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
]

const getSortedDays = (usFormat: boolean) =>
  usFormat ? [sunday, ...daysWithoutSunday] : [...daysWithoutSunday, sunday]

const getHours = (date: string, usFormat = false) =>
  format(new Date(date), usFormat ? 'hh:mm a' : 'HH:mm')

export default { getHours, getSortedDays }
