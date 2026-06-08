import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export const DATE_FORMAT = 'YYYY MMM DD, HH:mm'

export function formatDate (date: Dayjs | Date | string | number | undefined | null, format: string = DATE_FORMAT): string {
  if (!date) {
    return '-'
  }

  const dayjsDate = typeof date === 'string' || typeof date === 'number' || date instanceof Date
    ? dayjs(date)
    : date

  if (!dayjsDate.isValid()) {
    return '-'
  }

  return dayjsDate.format(format)
}
