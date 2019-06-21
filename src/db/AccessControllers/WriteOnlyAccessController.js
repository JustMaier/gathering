import IPFSAccessController from 'orbit-db-access-controllers/src/ipfs-access-controller'

export default class WriteOnlyAccessController extends IPFSAccessController {
  static get type () { return 'write-only' }

  async canAppend (entry, identityProvider) {
    return identityProvider.verifyIdentity(entry.identity)
  }

  static async create (orbitdb, options) {
    options = { ...options, ...{ write: options.write || [orbitdb.identity.id] } }
    return new this(orbitdb._ipfs, options)
  }
}
