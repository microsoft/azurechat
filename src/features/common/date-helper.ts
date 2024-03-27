export const xDaysAgo = (length?: number): string => {
  const date = new Date()
  if (!length) {
    date.setFullYear(2020)
    return date.toISOString()
  }
  date.setDate(date.getDate() - length)
  return date.toISOString()
}

export const xMonthsAgo = (length?: number): string => {
  const date = new Date()
  if (!length) {
    date.setFullYear(2020)
    return date.toISOString()
  }
  date.setMonth(date.getMonth() - length)
  return date.toISOString()
}
