import IPFSAccessController from 'orbit-db-access-controllers/src/ipfs-access-controller'

export default class IdBoundAccessController extends IPFSAccessController {
  static get type () { return 'id-bound' }

  constructor (ipfs, options) {
    super(ipfs, options)

    ipfs.id().then(peerInfo => { this.peerId = peerInfo.id })
  }

  async canAppend (entry, identityProvider) {
    const permittedKey = entry.identity.id
    if (!this.write.includes(permittedKey) && permittedKey !== entry.payload.key) return false
    return identityProvider.verifyIdentity(entry.identity)
  }

  static async create (orbitdb, options) {
    options = { ...options, ...{ write: options.write || [orbitdb.identity.id] } }
    return new this(orbitdb._ipfs, options)
  }
}
