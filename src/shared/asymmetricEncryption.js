import { box, randomBytes } from 'tweetnacl'
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util'

const newNonce = () => randomBytes(box.nonceLength)
export const generateKeyPair = () => {
  var keys = box.keyPair()
  return {
    private: encodeBase64(keys.secretKey),
    public: encodeBase64(keys.publicKey)
  }
}

export const encrypt = (myPrivateKey, json, theirPublicKey = null) => {
  const nonce = newNonce()
  const messageUint8 = decodeUTF8(JSON.stringify(json))
  const encrypted = box(messageUint8, nonce, decodeBase64(theirPublicKey), decodeBase64(myPrivateKey))

  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)

  const base64FullMessage = encodeBase64(fullMessage)
  return base64FullMessage
}

export const decrypt = (myPrivateKey, messageWithNonce, theirPublicKey) => {
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce)
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonce.length
  )

  const decrypted = box.open(message, nonce, decodeBase64(theirPublicKey), decodeBase64(myPrivateKey))

  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  const base64DecryptedMessage = encodeUTF8(decrypted)
  return JSON.parse(base64DecryptedMessage)
}
