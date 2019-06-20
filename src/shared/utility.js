export const updateState = state => {
  const uState = updates => ({ ...state, ...updates })
  uState.current = state
  return uState
}

export const uuid = () => 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0
  // eslint-disable-next-line no-mixed-operators
  const v = c === 'x' ? r : r & 0x3 | 0x8
  return v.toString(16)
})

export const toQueryString = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&')

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days)
  return date
}

export const isSetEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))
