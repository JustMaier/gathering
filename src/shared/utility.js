export const updateState = state => {
  const uState = updates => ({ ...state, ...updates })
  uState.current = state
  return uState
}

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days)
  return date
}
