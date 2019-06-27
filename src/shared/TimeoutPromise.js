export default function TimeoutPromise (handler, ms, message = 'Timed out') {
  // Create a promise that rejects in <ms> milliseconds
  let timeoutId
  const timeout = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })

  const promise = new Promise(handler)
  promise.then(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}
