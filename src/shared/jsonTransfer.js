import pull from 'pull-stream'
import { JsonToBuffer, JsonFromBuffer } from './jsonBuffer'

export const sendJson = (conn, data) => pull(pull.once(JsonToBuffer(data)), conn)
export const receiveJson = conn => new Promise((resolve, reject) => {
  try {
    pull(
      conn,
      pull.drain(buffer => resolve(JsonFromBuffer(buffer)))
    )
  } catch (err) {
    reject(err)
  }
})
