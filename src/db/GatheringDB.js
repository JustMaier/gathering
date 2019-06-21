import { EventEmitter } from 'events'
import AccessControllers from './AccessControllers'
import UsernameGenerator from 'username-generator'
import resizeImage from '../shared/resizeImage'

export const STARS_LIMIT = 3

const createForAddress = async (orbitdb, type, dbName, dbOptions, setup = null) => {
  const db = await orbitdb.open(dbName, { create: true, type, ...dbOptions })
  await db.load()
  if (setup) await setup(db)
  const address = db.address.toString()
  await db.close()

  return address
}

const slugify = (str, maxLength = 12) => str.toLowerCase().match(/([a-z0-9]+)/g).join('-').substring(0, maxLength)
const btoa = str => window ? window.btoa(str) : str

class GatheringDB extends EventEmitter {
  constructor (IPFS, OrbitDB, options = {}) {
    super()
    this.IPFS = IPFS
    this.OrbitDB = OrbitDB
    this._options = {
      locationBase: window ? window.location.origin : null,
      ...options
    }

    this.node = new this.IPFS({
      repo: '/orbitdb/gathering',
      start: true,
      preload: { enabled: false },
      EXPERIMENTAL: { pubsub: true },
      config: {
        Addresses: {
          Swarm: [
            // Use IPFS dev signal server
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          ]
        }
      }
    })

    this.node.on('error', e => { throw e })
    this.node.on('ready', this._init.bind(this))
  }

  async _init () {
    this.peerInfo = await this.node.id()
    this.orbitdb = await this.OrbitDB.createInstance(this.node, {
      AccessControllers
    })
    this.memberId = this.orbitdb.identity.id

    this.defaultOptions = {
      accessController: { write: [this.memberId] }
    }
    this.publicOptions = {
      accessController: { write: ['*'] }
    }
    this.idBoundOptions = {
      accessController: {
        type: 'id-bound',
        write: [this.memberId]
      }
    }
    this.writeOnlyOptions = {
      accessController: {
        type: 'write-only',
        write: ['*']
      }
    }

    // Gatherings
    // ==================
    this.gatherings = await this.orbitdb.kvstore('gatherings')
    await this.gatherings.load()

    this.appSettings = await this.orbitdb.kvstore('appSettings')
    await this.appSettings.load()

    // const activeGathering = this.appSettings.get('activeGathering')
    // if (activeGathering) this.activateGathering(activeGathering)

    this.emit('ready', this)
    this.ready = true
  }

  /* #region Encryption */
  encrypt (data, key) {
    return JSON.stringify(data)
  }

  decrypt (data, key) {
    return JSON.parse(data)
  }
  /* #endregion */

  /* #region  Gathering */
  getGatherings () {
    return Object.values(this.gatherings.all)
  }

  async activateGathering (key) {
    const start = new Date()
    console.log('start')
    await this.appSettings.put('activeGathering', key)
    const { address, cid, ...rest } = this.gatherings.get(key)
    this.gathering = await this.orbitdb.open(address, { sync: true })
    await this.gathering.load()
    console.log('gathering', new Date() - start)

    // Update our gatherings record if possible
    if (!rest.name && this.gathering.get('name')) {
      this.gatherings.put(key, {
        address,
        cid,
        ...rest,
        name: this.gathering.get('name'),
        end: this.gathering.get('end')
      })
    }

    await Promise.all(['events', 'affinities', 'media', 'members'].map(async key => {
      console.log(this.gathering.get(key))
      this[key] = await this.orbitdb.open(this.gathering.get(key))
      await this[key].load()
    }))

    // Load user profile
    this.my = { cid }
    try {
      this.my.profile = await this.members.get(this.memberId)
      if (!this.my.profile) throw new Error('You\'re not in the gathering')
    } catch (err) {
      // Setup new member if existing record not found
      const getAddress = async (name, type, options = {}, setup = null) => createForAddress(this.orbitdb, type, `${key}:${name}`, options, setup)

      this.my.profile = {
        id: this.memberId,
        name: UsernameGenerator.generateUsername(' '),
        avatar: null,
        affinities: [],
        starsSpent: await getAddress('starsSpent', 'counter', this.defaultOptions),
        recommendations: await getAddress('recommendations', 'keyvalue', this.idBoundOptions),
        stars: await getAddress('stars', 'keyvalue', this.idBoundOptions),
        connectionRequests: await getAddress('requests', 'keyvalue', this.idBoundOptions),
        connections: await getAddress('connections', 'keyvalue', this.defaultOptions)
      }

      await this.updateMe({
        name: this.my.profile.name,
        avatar: this.my.profile.avatar,
        affinities: this.my.profile.affinities
      })

      await this.members.put(this.memberId, this.my.profile)
      await this.trackEvent({ type: 'members:join' })
    }

    // Member Events
    console.log('members', new Date() - start)
    this.members.events.on('replicated', () => this.openMemberDatabases())
    await this.openMemberDatabases()

    // Affinity Events
    console.log('affs', new Date() - start)
    this.affinities.events.on('replicated', () => this.openAffinityCounters())
    this.affinities.events.on('write', () => this.openAffinityCounters())
    await this.openAffinityCounters()

    // Easy access to my member databases
    Object.keys(this.memberDbs[this.memberId]).forEach(key => {
      this.my[key] = this.memberDbs[this.memberId][key]
    })

    // Shareable address
    const encodedAddress = encodeURI(btoa(this.gathering.address.toString()))
    this.shareableAddress = `${this._options.locationBase}/?g=${encodedAddress}`

    console.log('done', new Date() - start)
    this.emit('gathering:activated', this.gathering.all)
  }

  async deactivateGathering () {
    await this.closeAffinityCounters()
    await this.closeMemberDatabases()
    await Promise.all(['events', 'affinities', 'media', 'members'].map(async key => {
      await this[key].close()
    }))
    await this.gathering.close()
    await this.appSettings.del('activeGathering')
    this.gathering = null
    this.emit('gathering:deactivated', this.gathering)
  }

  async createGathering (gathering) {
    const key = slugify(gathering.name)
    const getAddress = async (name, type, options = {}) => createForAddress(this.orbitdb, type, `${key}_${name}`, options)

    const gatheringDb = await this.orbitdb.kvstore(key)
    await gatheringDb.load()
    gathering = {
      ...gathering,
      key,
      events: await getAddress('events', 'eventlog', this.publicOptions),
      affinities: await getAddress('affinities', 'keyvalue', this.writeOnlyOptions),
      media: await getAddress('media', 'docstore', this.publicOptions),
      members: await getAddress('members', 'keyvalue', this.idBoundOptions)
    }
    const keys = Object.keys(gathering)
    for (let i in keys) {
      const key = keys[i]
      await gatheringDb.put(key, gathering[key])
    }

    await this.gatherings.put(key, {
      key,
      name: gathering.name,
      end: gathering.end,
      address: gatheringDb.address.toString()
    })
    await gatheringDb.close()

    return key
  }

  async joinGathering (address) {
    const existing = Object.values(this.gatherings.all).find(x => x.address === address)
    if (existing) return existing.key

    const key = address.split('/').slice(3).join('')
    await this.gatherings.put(key, {
      key,
      address
    })

    const gathering = await this.orbitdb.open(address, { sync: true })
    return new Promise(resolve => {
      gathering.events.on('replicated', async () => {
        await gathering.close()
        resolve(key)
      })
    })
  }
  /* #endregion */

  /* #region IPFS */
  async getJsonFromCid (cid) {
    const files = await this.node.get(cid)
    if (!files[0]) return null

    const json = JSON.parse(files[0].content.toString())
    return json
  }

  async addImage (file, { width, height } = {}) {
    if (width && height) file = await resizeImage(file, width, height)
    const result = await this.node.add(file)
    const cid = result[0].hash
    return cid
  }

  async getImageFromCid (cid) {
    try {
      if (!cid) throw new Error('Empty hash')
      const files = await this.node.get(cid)
      if (!files[0]) return null

      const base64 = files[0].content.toString('base64')
      return 'data:image/jpeg;base64,' + base64
    } catch (err) {
      return '/img/placeholder.jpg'
    }
  }
  /* #endregion */

  /* #region Events */
  async trackEvent (event) {
    console.log('track', event)
    await this.events.add({ ...event, time: new Date().getTime() })
  }
  /* #endregion */

  /* #region Requests */
  async getRequests () {
    console.log(this.memberId, this.my.connectionRequests.all)
    const requests = await Promise.all(Object.keys(this.my.connectionRequests.all).map(async fromId => {
      const member = this.getMember(fromId)
      return member
    }))

    return requests
  }

  async acceptRequest (id) {
    await this.my.connections.put(id, this.my.connectionRequests.get(id))
    await this.my.connectionRequests.del(id)

    const haventSentRequest = !this.memberDbs[id].connectionRequests.get(this.memberId) && !this.memberDbs[id].connections.get(this.memberId)
    if (haventSentRequest) await this.sendRequest(id)
  }

  async declineRequest (id) {
    await this.my.connectionRequests.del(id)
  }

  async sendRequest (id) {
    if (this.memberDbs[id].connections.get(this.memberId) || this.memberDbs[id].connectionRequests.get(this.memberId)) return
    await this.memberDbs[id].connectionRequests.put(this.memberId, this.encrypt(this.my.cid, id))
    await this.trackEvent({ type: 'connections:send', to: id })
  }

  /* #endregion */

  /* #region Members */
  getMember (id) {
    return { ...this.members.get(id), id, dbs: this.memberDbs[id] }
  }

  async queryMembers (queryFn) {
    return Object.values(this.members.all).filter(queryFn)
  }

  async openMemberDatabases () {
    if (!this.memberDbs) this.memberDbs = {}
    const memberDbIds = Object.keys(this.memberDbs)
    console.log(Object.keys(this.members.all).length)

    const toOpen = []
    Object.keys(this.members.all).filter(x => !memberDbIds.includes(x)).forEach(memberId => {
      const member = this.members.get(memberId)
      Object.keys(member)
        .map(key => ({ key, value: member[key] }))
        .filter(x => x.value && typeof x.value === 'string' && x.value.startsWith('/orbitdb/'))
        .forEach(({ key, value }) => {
          toOpen.push({ memberId, key, address: value })
        })
    })

    const loadMemberDb = async ({ memberId, key, address }) => {
      if (!this.memberDbs[memberId]) this.memberDbs[memberId] = {}
      this.memberDbs[memberId][key] = await this.orbitdb.open(address)
      await this.memberDbs[memberId][key].load()
    }

    await Promise.all(toOpen.filter(x => x.memberId === this.memberId).map(loadMemberDb))
    Promise.all(toOpen.filter(x => x.memberId !== this.memberId).map(loadMemberDb))
  }

  async closeMemberDatabases () {
    await Promise.all(Object.keys(this.memberDbs).map(async memberId => {
      await Promise.all(Object.keys(this.memberDbs[memberId]).map(async key => {
        try {
          await this.memberDbs[memberId][key].close()
        } catch (err) {}
      }))
      delete this.memberDbs[memberId]
    }))
  }
  /* #endregion */

  /* #region Awards */
  async getAwards () {
    // TODO

  }
  /* #endregion */

  /* #region Contacts */
  async getContacts () {
    const contactCids = Object.keys(this.my.connections.all).map(fromId => ({
      fromId,
      cid: this.decrypt(this.my.connections.all[fromId], this.privateKey)
    }))
    // TODO if this is slow, just send the CID and resolve on the front end
    const contacts = await Promise.all(contactCids.map(async ({ fromId, cid }) => ({
      ...await this.getJsonFromCid(cid),
      stars: this.memberDbs[fromId].stars.get(this.memberId) || 0,
      id: fromId
    })))

    console.log(contacts)
    return contacts
  }

  async getContact (id) {
    const cid = this.decrypt(this.my.connections.get(id), this.privateKey)
    const contact = {
      ...await this.getJsonFromCid(cid),
      id
    }

    // TODO more props?
    const member = this.getMember(id)
    contact.stars = member.dbs.stars.get(this.memberId) || 0

    return contact
  }

  async getMe () {
    return this.getJsonFromCid(this.my.cid)
  }

  async updateMe (contactInfo) {
    // Update affinityCounts
    const affectedAffinities = [...new Set(this.my.profile.affinities.concat(contactInfo.affinities || []))]
    for (let affinityName in affectedAffinities) {
      const added = contactInfo.affinities.includes(affinityName) && !this.my.profile.affinities.includes(affinityName)
      const removed = !contactInfo.affinities.includes(affinityName) && this.my.profile.affinities.includes(affinityName)

      if (added || removed) await this.affinityCounters[affinityName].inc(added ? 1 : -1)
    }

    // Update member record
    this.my.profile = {
      ...this.my.profile,
      name: contactInfo.name.trim(),
      avatar: contactInfo.avatar,
      affinities: contactInfo.affinities
    }
    await this.members.put(this.memberId, this.my.profile)

    // Update contact record
    // TODO encrypt this with a key that is shared when connecting
    const buffer = this.IPFS.Buffer(JSON.stringify(contactInfo))
    const result = await this.node.add(buffer)
    this.my.cid = result[0].hash

    const gatheringKey = this.appSettings.get('activeGathering')
    await this.gatherings.put(gatheringKey, {
      ...this.gatherings.get(gatheringKey),
      cid: this.my.cid
    })

    return this.my.cid
  }

  async deleteContact (id) {
    await this.my.connections.del(id)
  }
  /* #endregion Contacts */

  /* #region Affinities */
  getAffinities () {
    return Object.keys(this.affinities.all).map(name => ({ ...this.affinities.all[name], name })) || []
  }

  async addAffinity ({ name, color }) {
    await this.affinities.put(name, {
      color,
      members: await createForAddress(this.orbitdb, 'counter', `affinity:${slugify(name)}`)
    })

    await this.trackEvent({ type: 'affinities:add', payload: name })

    return name
  }

  async openAffinityCounters () {
    if (!this.affinityCounters) this.affinityCounters = {}
    await Promise.all(Object.values(this.affinities.all).filter(x => !this.affinityCounters[x.name]).map(async affinity => {
      this.affinityCounters[affinity.name] = await this.orbitdb.open(affinity.members)
      await this.affinityCounters[affinity.name].load()
    }))
  }

  async closeAffinityCounters () {
    await Promise.all(Object.keys(this.affinityCounters).map(async name => {
      await this.affinityCounters[name].close()
      delete this.affinityCounters[name]
    }))
  }
  /* #endregion */

  /* #region Recommendations */
  getRecommendations () {
    const memberIds = {}
    Object.keys(this.my.recommendations.all).forEach(fromId => {
      this.my.recommendations.all[fromId].forEach(memberId => {
        if (!memberIds[memberId]) memberIds[memberId] = []
        memberIds[memberId].push(fromId)
      })
    })

    const members = Object.keys(memberIds)
      .filter(id => {
        const notConnected = this.memberDbs[id].connections.get(this.memberId) == null && this.memberDbs[id].connectionRequests.get(this.memberId) == null
        return notConnected
      })
      .map(memberId => ({
        ...this.getMember(memberId),
        id: memberId,
        fromIds: [...new Set(memberIds[memberId])]
      }))

    return members
  }

  async sendRecommendation (toId, forId) {
    const currentRecommendations = this.memberDbs[toId].recommendations.get(this.memberId) || []
    await this.memberDbs[toId].recommendations.put(this.memberId, [
      ...currentRecommendations,
      forId
    ])

    this.trackEvent({ type: 'recommendations:add', to: toId })
  }

  async deleteRecommendation (memberId) {
    const fromIds = Object.keys(this.my.recommendations.all)
    for (let i in fromIds) {
      const fromId = fromIds[i]
      const memberIds = this.my.recommendations.all[fromId]
      const index = memberIds.indexOf(memberId)

      if (index !== -1) {
        await this.my.recommendations.put(fromId, memberIds.splice(index, 1))
      }
    }
  }
  /* #endregion */

  /* #region Affinities */
  getMyStars () {
    return this.my.stars.all
  }

  async addStar (id) {
    if (this.my.starsSpent.value >= STARS_LIMIT) throw new Error('You don\'t have any stars left')

    const currentStars = this.memberDbs[id].stars.get(this.memberId) || 0
    await this.memberDbs[id].stars.put(this.memberId, currentStars + 1)
    await this.my.starsSpent.inc(1)
    await this.trackEvent({ type: 'stars:add', to: id })

    return this.memberDbs[id].stars.get(this.memberId)
  }
  /* #endregion */
}

export default GatheringDB
