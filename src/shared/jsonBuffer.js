import { Buffer } from 'ipfs'
import stringify from 'json-stable-stringify'

export const JsonToBuffer = obj => Buffer.from(stringify(obj))
export const JsonFromBuffer = buffer => JSON.parse(buffer.toString('utf8'))
