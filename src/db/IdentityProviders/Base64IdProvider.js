import OrbitDBIdentityProvider from 'orbit-db-identity-provider/src/orbit-db-identity-provider'
const type = 'orbitdb-64'

export default class Base64IdProvider extends OrbitDBIdentityProvider {
  static get type () { return type }

  async getId (options = {}) {
    const id = options.id
    if (!id) {
      throw new Error('id is required')
    }

    const keystore = this._keystore
    const key = await keystore.getKey(id) || await keystore.createKey(id)
    return key.public.marshal().toString('base64')
  }
}
