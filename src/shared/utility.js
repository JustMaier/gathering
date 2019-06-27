export const updateState = state => {
  const uState = updates => ({ ...state, ...updates })
  uState.current = state
  return uState
}

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days)
  return date
}

export function timeLeft (date) {
  if (typeof date === 'string') date = new Date(date)
  const now = new Date()
  const diff = (date - now) / 1000

  const days = Math.floor(diff / (60 * 60 * 24))
  if (days > 0) return `${days}d left`

  const hours = Math.floor(diff / (60 * 60))
  if (hours > 0) return `${hours}h left`

  const minutes = Math.floor(diff / 60)
  if (minutes > 0) return `${minutes}m left`

  const seconds = Math.floor(diff)
  if (seconds > 0) return `${seconds}s left`

  return null
}
