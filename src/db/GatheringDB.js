import { EventEmitter } from 'events'
import GatheringStore from './GatheringStore/Store'
import UsernameGenerator from 'username-generator'
import resizeImage from '../shared/resizeImage'
import TimeoutPromise from '../shared/TimeoutPromise'
import * as symmetricEncryption from '../shared/symmetricEncryption'
import * as asymmetricEncryption from '../shared/asymmetricEncryption'
import { ConnectionStatus, RecommendationStatus } from './GatheringStore/Index'
import cleanSocialUrls from '../shared/cleanSocialUrls'
import { receiveJson, sendJson } from '../shared/jsonTransfer'
import LocalStorageStore from './LocalStorageStore'

const signalServer = '/dns4/signal.gthr.io/tcp/9090/wss/p2p-websocket-star'

const slugify = (str, maxLength = 12) => str.toLowerCase().match(/([a-z0-9]+)/g).join('-').substring(0, maxLength)
const btoa = str => window ? window.btoa(str) : str
const replicateProgressReader = (db) => {
  const current = Math.max(db._replicationStatus.progress, db._oplog.length)
  const total = db._replicationStatus.max
  return (total === 0 ? null : ((current / total) * 100).toFixed(0))
}

class GatheringDB extends EventEmitter {
  constructor (IPFS, OrbitDB, options = {}) {
    super()
    this.IPFS = IPFS
    this.OrbitDB = OrbitDB
    this.OrbitDB.addDatabaseType('gathering', GatheringStore)
    this._options = {
      locationBase: window ? window.location.origin : null,
      ...options
    }

    this.awards = [
      {
        name: 'MVP',
        property: 'points'
      }
      // {
      //   name: 'Connections',
      //   property: 'requestsAccepted'
      // },
      // {
      //   name: 'Human Router',
      //   property: 'recommendations'
      // },
      // {
      //   name: 'Matches',
      //   property: 'recommendationsAccepted'
      // }
      // {
      //   name: 'High Priest',
      //   property: 'stars'
      // },
      // {
      //   name: 'Oracle',
      //   property: 'superMatches'
      // }
    ]

    this.node = new this.IPFS({
      repo: '/orbitdb/gathering',
      start: true,
      preload: { enabled: false },
      EXPERIMENTAL: { pubsub: true },
      config: {
        Addresses: {
          Swarm: [
            signalServer
          ]
        },
        Bootstrap: []
      }
    })

    this.node.on('error', e => { this.emit('error', e) })
    this.node.on('ready', this._init.bind(this))
  }

  async _init () {
    this.peerInfo = await this.node.id()
    this.orbitdb = await this.OrbitDB.createInstance(this.node, {})
    this.memberId = this.orbitdb.identity.id

    // Protocols
    // ==================
    this.node.libp2p.handle('/gathering/1.0.0/snapshot', (protocol, conn) => {
      sendJson(conn, this.gathering._index._tables)
    })

    // Orbit DB Options
    // ==================
    this.defaultOptions = {
      accessController: { write: [this.memberId] }
    }
    this.publicOptions = {
      accessController: { write: ['*'] }
    }

    // Gatherings
    // ==================
    this.appSettings = new LocalStorageStore('appSettings')
    this.gatherings = new LocalStorageStore('gatherings')
    if (this.gatherings.get('migrated')) {
      this.appSettings.put('migrated', true)
      this.gatherings.del('migrated')
    }
    if (!this.appSettings.get('migrated')) {
      console.log('migrating')
      this.emit('loading:message', 'Migrating Gatherings')
      const oldGatherings = await this.orbitdb.kvstore('gatherings', { replicated: false })
      await oldGatherings.load()
      Object.keys(oldGatherings.all).forEach(k => {
        this.gatherings.put(k, oldGatherings.all[k])
      })
      this.appSettings.put('migrated', true)
      await oldGatherings.close()
    }

    this.emit('ready', this)
    this.ready = true
  }

  /* #region  Gathering */
  getGatherings () {
    return Object.values(this.gatherings.all)
  }

  async activateGathering (key) {
    window.localStorage.activeGathering = key
    const { address, shareableKey, asymmetricKeyPair, ...rest } = this.gatherings.get(key)
    this.emit('loading:message', 'Opening Gathering DB')
    this.gathering = await this.orbitdb.open(address, { sync: true })
    this.gathering.events.on('replicate.progress', () => {
      this.emit('loading:progress', replicateProgressReader(this.gathering))
    })

    this.gathering.events.on('write', () => this.gathering.saveSnapshot())

    let maxTotal = 0
    this.gathering.events.on('load.progress', (address, hash, entry, progress, total) => {
      maxTotal = Math.max.apply(null, [maxTotal, progress, 0])
      total = Math.max.apply(null, [progress, maxTotal, total, entry.clock.time, 0])
      this.emit('loading:progress', ((maxTotal / total) * 100).toFixed(0))
    })

    this.emit('loading:message', 'Loading Gathering DB')
    try {
      await this.gathering.loadFromSnapshot()
      this.gathering.load().then(() => {
        this.gathering.events.on('replicated', () => this.gathering.saveSnapshot())
      })
    } catch (err) {
      this.emit('error', 'Failed to load snapshot. Loading full log.')
      await this.gathering.load()
      await this.gathering.saveSnapshot()
      this.gathering.events.on('replicated', () => this.gathering.saveSnapshot())
    }

    // Connect to members
    setInterval(() => this.connectToMembers(), 30000)

    // Update our gatherings record if possible
    if (!rest.name && this.gathering.get('name')) {
      this.emit('loading:message', 'Updating Gathering Listing')
      this.gatherings.put(key, {
        address,
        shareableKey,
        asymmetricKeyPair,
        ...rest,
        name: this.gathering.get('name'),
        end: this.gathering.get('end')
      })
    }

    // Get keys ready
    this.keys = {}

    // Load user profile
    this.my = { shareableKey, asymmetricKeyPair }
    if (this.gathering.me == null) {
      this.emit('loading:message', 'Creating your member record')
      if (new Date(this.gathering.all.end) < new Date()) {
        const err = new Error('This Gathering has ended')
        this.gatherings.del(key)
        this.emit('error', err)
        throw err
      }

      const codename = UsernameGenerator.generateUsername(' ')
      await this.gathering.putProfile({
        id: this.memberId,
        publicKey: asymmetricKeyPair.public,
        name: null,
        codename,
        organization: '',
        avatar: null,
        privateInfo: null,
        includeRank: true,
        peerId: this.peerInfo.id
      })
    }

    // Add new peer addresses
    if (!this.gathering.me.peerId) {
      this.emit('loading:message', 'Adding your peer id')
      await this.gathering.putProfile({
        ...this.gathering.me,
        peerId: this.peerInfo.id
      })
    }

    // Shareable address
    const encodedAddress = encodeURI(btoa(this.gathering.address.toString()))
    const encodedMemberId = encodeURI(btoa(this.memberId))
    const encodedPeerId = encodeURI(this.gathering.me.peerId)
    this.shareableAddress = `${this._options.locationBase}/?g=${encodedAddress}&m=${encodedMemberId}&p=${encodedPeerId}`

    this.emit('gathering:activated', this.gathering.all)
  }

  async deactivateGathering () {
    await this.gathering.close()
    delete window.localStorage.activeGathering
    this.gathering = null
    this.my = {}
    this.keys = {}
    this.emit('gathering:deactivated', this.gathering)
  }

  async createGathering (gathering) {
    const key = slugify(gathering.name, 8) + '-' + new Date().getTime()
    const gatheringDb = await this.orbitdb.open(key, {
      ...this.publicOptions,
      type: 'gathering',
      create: true
    })
    await gatheringDb.load()
    gathering = {
      ...gathering,
      key
    }
    const keys = Object.keys(gathering)
    for (let i in keys) {
      const key = keys[i]
      await gatheringDb.put(key, gathering[key])
    }

    this.gatherings.put(key, {
      key,
      name: gathering.name,
      end: gathering.end,
      address: gatheringDb.address.toString(),
      shareableKey: symmetricEncryption.generateKey(),
      asymmetricKeyPair: asymmetricEncryption.generateKeyPair()
    })
    await gatheringDb.close()

    return key
  }

  async joinGathering (address, bootstrapPeerId = null) {
    const existing = Object.values(this.gatherings.all).find(x => x.address === address)
    if (existing) return existing.key

    const key = address.split('/').slice(3).join('')
    if (bootstrapPeerId) {
      try {
        this.emit('loading:message', 'Connecting to bootstrap')
        await this.connectToPeer(bootstrapPeerId)
        this.emit('loading:message', 'Getting snapshot')
        window.localStorage[key] = JSON.stringify(await this.getSnapshot(bootstrapPeerId))
      } catch (err) {
        console.log('failed to connect bootstrap peer ' + bootstrapPeerId, err.message)
        this.emit('error', new Error('Couldn\'t connect to bootstrap peer'))
        throw err
      }
    }

    try {
      this.emit('loading:message', 'Finding DB')
      await new TimeoutPromise(async (resolve, reject) => {
        const gatheringDb = await this.orbitdb.open(address, { sync: true })
        await gatheringDb.close()
        resolve()
      }, 20000, 'Couldn\'t connect to gathering')

      this.gatherings.put(key, {
        key,
        address,
        shareableKey: symmetricEncryption.generateKey(),
        asymmetricKeyPair: asymmetricEncryption.generateKeyPair()
      })

      return key
    } catch (err) {
      this.emit('error', err)
      throw err
    }
  }
  /* #endregion */

  /* #region Awards */
  getAwards () {
    const ranks = {}
    this.awards.forEach(a => {
      ranks[a.name] = Object.keys(this.gathering.score)
        .filter(id => this.gathering.members[id] && this.gathering.members[id].includeRank !== false)
        .map(id => ({
          id,
          name: this.gathering.members[id] ? this.gathering.members[id].name : '',
          score: this.gathering.score[id][a.property]
        }))
        .sort((ma, mb) => mb.score - ma.score)
        .map((x, rank) => ({ ...x, rank: rank + 1 }))
    })

    return this.awards.map(a => ({
      name: a.name,
      rank: ranks[a.name]
    }))
  }

  async toggleAwardInclusion () {
    await this.gathering.putProfile({
      ...this.gathering.me,
      includeRank: this.gathering.me.includeRank != null ? !this.gathering.me.includeRank : false
    })
  }
  /* #endregion */

  /* #region IPFS */
  async addImage (file, { width, height } = {}) {
    if (width && height) file = await resizeImage(file, width, height)
    const result = await this.node.add(file)
    const cid = result[0].hash
    return cid
  }

  async getImageFromCid (cid) {
    if (!this.imageCache) this.imageCache = {}
    try {
      if (!cid) throw new Error('Empty hash')
      const files = await this.node.get(cid)
      if (!files[0]) return null

      const base64 = files[0].content.toString('base64')
      return 'data:image/jpeg;base64,' + base64
    } catch (err) {
      return null
    }
  }

  connectToPeer (peerId) {
    return this.node.swarm.connect(signalServer + '/ipfs/' + peerId)
  }

  async getSnapshot (peerId) {
    const conn = await new Promise((resolve, reject) => this.node.libp2p.dialProtocol(signalServer + '/ipfs/' + peerId, '/gathering/1.0.0/snapshot', (err, conn) => {
      if (err) reject(err)
      else resolve(conn)
    }))

    const snapshot = await receiveJson(conn)
    return snapshot
  }

  async connectToMembers () {
    const myPeerId = this.gathering.me.peerId
    await Promise.all(Object.values(this.gathering.members).filter(x => x.peerId != null && x.peerId !== myPeerId).map(async ({ name, peerId }) => {
      console.log('trying to connect to ' + name)
      try {
        await this.connectToPeer(peerId)
        console.log('connected to ' + name)
      } catch (err) {
        console.log('failed to connect to ' + name, err.message)
      }
    }))
  }
  /* #endregion */

  /* #region Requests */
  getRequests () {
    return Object.keys(this.gathering.connections)
      .map(id => ({ id, ...this.gathering.connections[id] }))
      .filter(x => x.status === ConnectionStatus.pending)
      .map(({ id }) => this.gathering.members[id])
  }

  getRequestsCount () {
    return Object.keys(this.gathering.connections)
      .map(id => ({ id, ...this.gathering.connections[id] }))
      .filter(x => x.status === ConnectionStatus.pending)
      .length
  }

  async acceptRequest (id) {
    await this.gathering.acceptConnection(id)
    try {
      await this.sendRequest(id) // Handles the case where connection has already been sent
    } catch (err) {
      // This is already handled sufficiently
    }
  }

  declineRequest (id) {
    return this.gathering.declineConnection(id)
  }

  async sendRequest (id) {
    try {
      await this.gathering.requestConnection(id, asymmetricEncryption.encrypt(this.my.asymmetricKeyPair.private, this.my.shareableKey, this.gathering.members[id].publicKey))
    } catch (err) {
      this.emit('error', err)
      throw err
    }
  }

  /* #endregion */

  /* #region Members */
  queryMembers (queryFn) {
    return Object.values(this.gathering.members).filter(queryFn)
  }
  /* #endregion */

  /* #region Contacts */
  getKeyFor (id) {
    if (!this.keys[id]) {
      if (id === this.memberId) this.keys[id] = this.my.shareableKey
      else if (this.gathering.connections[id] != null) {
        this.keys[id] = asymmetricEncryption.decrypt(this.my.asymmetricKeyPair.private, this.gathering.connections[id].key, this.gathering.members[id].publicKey)
      }
    }
    return this.keys[id]
  }

  getContacts () {
    const connections = this.gathering.connections
    const contacts = Object.keys(connections)
      .filter(id => this.gathering.connections[id].status === ConnectionStatus.accepted)
      .map(id => this.getContact(id, true))

    return contacts
  }

  getContact (id, publicOnly = false) {
    const { privateInfo: encryptedPrivateInfo, ...publicInfo } = this.gathering.members[id]
    let key
    if (!publicOnly) key = this.getKeyFor(id)

    let decryptedPrivateInfo = {}
    if (key) {
      try {
        decryptedPrivateInfo = symmetricEncryption.decrypt(encryptedPrivateInfo, key)
      } catch (err) {}
    }

    return {
      id,
      ...publicInfo,
      ...decryptedPrivateInfo,
      stars: this.gathering.getStarsFor(id)
    }
  }

  getMe () {
    return this.getContact(this.memberId)
  }

  async updateMe ({ name, avatar, organization, codename, peerId, ...unecryptedPrivateInfo }, affinities) {
    const isOnboarding = this.gathering.me.name == null && name != null

    // Update affinityCounts
    const currentAffinities = this.gathering.myAffinities
    const affectedAffinities = [...new Set(currentAffinities.concat(affinities || []))]
    for (let i in affectedAffinities) {
      const affinityName = affectedAffinities[i]
      const added = affinities.includes(affinityName) && !currentAffinities.includes(affinityName)
      const removed = !affinities.includes(affinityName) && currentAffinities.includes(affinityName)

      if (added) await this.gathering.addToAffinity(affinityName)
      else if (removed) await this.gathering.removeFromAffinity(affinityName)
    }

    // Update member record
    cleanSocialUrls(unecryptedPrivateInfo)
    const privateInfo = symmetricEncryption.encrypt(unecryptedPrivateInfo, this.my.shareableKey)
    await this.gathering.putProfile({
      name: name.trim(),
      organization,
      avatar,
      peerId,
      codename: codename.trim(),
      publicKey: this.my.asymmetricKeyPair.public,
      privateInfo
    })

    // Trigger onboarding
    if (isOnboarding) this.emit('gathering:onboarded')
  }

  deleteContact (id) {
    return this.gathering.deleteConnection(id)
  }
  /* #endregion Contacts */

  /* #region Notes */
  getNotesFor (id) {
    return this.gathering.getNotesFor(id) || ''
  }

  setNotesFor (id, notes) {
    return this.gathering.setNotesFor(id, notes)
  }
  /* #endregion */

  /* #region Affinities */
  getAffinities () {
    return Object.keys(this.gathering.affinities).map(name => {
      const affinity = this.gathering.affinities[name]
      return { ...affinity, name, memberCount: Object.keys(affinity.members).length }
    }).sort((a, b) => b.memberCount - a.memberCount)
  }

  getAffinitiesFor (id) {
    return this.gathering.getAffinitiesFor(id)
  }

  getMyAffinities () {
    const affinities = this.gathering.myAffinities
    return affinities
  }

  addAffinity ({ name, color }) {
    return this.gathering.addAffinity(name, { color })
  }
  /* #endregion */

  /* #region Recommendations */
  getRecommendations () {
    return Object.keys(this.gathering.recommendations)
      .map(id => ({ id, ...this.gathering.recommendations[id] }))
      .filter(({ status }) => status === RecommendationStatus.pending)
      .map(({ id, by }) => ({
        id,
        ...this.gathering.members[id],
        by: Object.keys(by).map(byId => this.gathering.members[byId].name)
      }))
  }

  getRecommendationCount () {
    return Object.keys(this.gathering.recommendations)
      .map(id => ({ id, ...this.gathering.recommendations[id] }))
      .filter(({ status }) => status === RecommendationStatus.pending)
      .length
  }

  sendRecommendation (toId, forId) {
    try {
      return this.gathering.sendRecommendation(toId, forId)
    } catch (err) { this.emit('error', err) }
  }

  deleteRecommendation (forId) {
    return this.gathering.declineRecommendation(forId)
  }
  /* #endregion */

  /* #region Stars */
  get starsAvailable () {
    return this.gathering.starsAvailable
  }
  addStar (id) {
    return this.gathering.sendStar(id)
  }
  /* #endregion */
}

export default GatheringDB
