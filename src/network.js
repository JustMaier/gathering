import DataNode from 'libp2p-json-node'
import LevelStore from 'datastore-level'
import levelJs from 'level-js'
import md5 from 'md5-hash'
import { isSetEqual } from './shared/utility'

const shorten = peerId => peerId.substring(2).substring(0, 6)

const swapContact = {
  timeout: 20000,
  attempts: 20,
  timeoutMessage: 'Could not reach someone with that codename',
  request: (network, channel, myContactInfo, theirCodename) => new Promise((resolve, reject) => {
    const listener = ({ data }, res) => {
      // If they aren't the person we want to swap with, ignore it...
      if (data.codename.toLowerCase() !== theirCodename.toLowerCase()) res.send(null)
      else {
        resolve(data)
        clearInterval(interval)
        res.send(myContactInfo)
      }
    }
    network.once(channel.topic, listener)

    let attempts = swapContact.attempts
    const interval = setInterval(() => {
      if (attempts === 0) {
        clearInterval(interval)
        network.off(channel.topic, listener)
        reject(new Error(swapContact.timeoutMessage))
      } else {
        channel.publish('connect', theirCodename)
        attempts--
        console.log(`Send ${channel.topic} | ${attempts} attempts left`)
      }
    }, swapContact.timeout / attempts)
  }),
  listen: (network, channel, myContactInfo) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      channel.off('connect')
      reject(new Error(swapContact.timeoutMessage))
    }, swapContact.timeout)

    channel.once('connect', async ({ data, peerInfo }) => {
      if (data.toLowerCase() !== myContactInfo.codename.toLowerCase()) return

      const res = await network.send(peerInfo, channel.topic, myContactInfo)
      resolve(res.data)
      clearTimeout(timeout)
    })

    console.log(`Listen ${channel.topic}`)
  })
}

class MeshNet extends DataNode {
  gathering;

  static async create () {
    const datastore = new LevelStore('gatheringnode', { db: levelJs })
    await new Promise(resolve => datastore.open(resolve))
    const node = await super.create({
      datastore,
      signalingServer: process.env.REACT_APP_SIGNALSERVER,
      config: {
        // peerDiscovery: { autoDial: false }
      }
    })

    return node
  }

  start (gathering) {
    this.gathering = gathering
    this.protocol = `/gathering/1.0.0/${gathering.id.substring(0, 5)}`

    this._activePeers = new Set()
    const emitActivePeerChange = () => {
      console.log(this.peerBook.getAllArray().filter(x => x.isConnected()).map(x => x.id.toB58String()))
      const newActivePeers = new Set(this.peerBook.getAllArray().filter(x => x.isConnected()))
      if (isSetEqual(newActivePeers, this._activePeers)) return

      this._activePeers = newActivePeers
      this._connected = this._activePeers.length
      this.emit('peer:change', this._activePeers)
    }
    this.on('peer:connect', emitActivePeerChange)
    this.on('peer:disconnect', emitActivePeerChange)
    this.on('peer:ignored', peerInfo => console.log('ignoring', peerInfo.id.toB58String()))
    this.on('peer:error', (peerInfo, err) => console.log('Dial failed', peerInfo.id.toB58String(), err.message))

    this._connected = false
    this.on('peer:change', activePeers => {
      const newConnectionStatus = activePeers.size > 0
      if (this._connected === newConnectionStatus) return

      this._connected = newConnectionStatus
      this.emit('connection:change', { connected: this._connected })
      this.emit(`connection:${!this._connected ? 'disconnected' : 'connected'}`)
    })

    return super.start()
  }

  stop () {
    this.gathering = null
    return super.stop()
  }

  async createGathering (gathering) {
    // Instantiate gathering DHT values
    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/connections`, [])
    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities`, [])
  }
  async swapContactInfo (theirCodename) {
    const channelParts = [this.gathering.contact.codename.toLowerCase(), theirCodename.toLowerCase()].sort()
    const isDialer = this.gathering.contact.codename.toLowerCase() === channelParts[0]
    const topic = shorten(md5(channelParts.join(':')))
    const channel = this.subscribe(topic)

    let theirContactInfo
    const myContactInfo = { ...this.gathering.contact.serialize(), peerId: this.peerId }
    try {
      if (isDialer) theirContactInfo = await swapContact.request(this, channel, myContactInfo, theirCodename)
      else theirContactInfo = await swapContact.listen(this, channel, myContactInfo)
      console.log('got contact', theirContactInfo)
    } catch (err) {
      this.unsubscribe(topic)
      throw err
    }

    const [a, b] = [this.peerId, theirContactInfo.peerId].map(shorten).sort()
    this.upsertConnection({ a, b, active: true }, ['active'])

    return theirContactInfo
  }
  async getConnections () {
    return this.dht.getJSONAsync(`gathering:${this.gathering.id}/connections`)
  }
  async getConnection (peerId) {
    const [a, b] = [peerId, this.peerId].map(shorten).sort()
    const connections = await this.getConnections()
    return connections.find(x => x.a === a && x.b === b)
  }
  async upsertConnection (connection, properties = null) {
    const connections = await this.getConnections()
    const target = connections.find(x => x.a === connection.a && x.b === connection.b)
    if (target) {
      if (properties) properties.forEach(prop => { target[prop] = connection[prop] })
      else connections.splice(connections.indexOf(target), 1, connection)
    } else {
      connections.push({
        via: null,
        active: true,
        stars: [0, 0],
        ...connection
      })
    }
    return this.dht.putJSONAsync(`gathering:${this.gathering.id}/connections`, connections)
  }
  async addStar (peerId) {
    const connection = await this.getConnection(peerId)
    const isA = connection.a === shorten(peerId)
    connection.stars[isA ? 0 : 1]++
    return this.upsertConnection(connection, ['stars'])
  }
  async recommendContact (peerId, toId) {
    const connections = await this.getConnections()
    const [a, b] = [peerId, toId].map(shorten).sort()
    const targetIndex = connections.findIndex(x => x.a === a && x.b === b)
    if (!targetIndex) this.upsertConnection({ a, b, via: shorten(this.peerId), active: false })
  }
  async getRecommendations () {
    const connections = await this.getConnections()
    const shortPeerId = shorten(this.peerId)
    return connections.filter(x => (x.a === shortPeerId || x.b === shortPeerId) && x.via && !x.active)
  }
  async getPublicInfo (peerId) {
    return this.dht.getJSONAsync(`gathering:${this.gathering.id}/peer:${shorten(peerId)}`)
  }
  async updatePublicInfo (info) {
    let currentInfo = { affinities: [] }
    try {
      currentInfo = await this.getPublicInfo(this.peerId)
    } catch {}

    // Remove from removed affinities
    await Promise.all(currentInfo.affinities.filter(id => !info.affinities.includes(id)).map(async id => {
      await this.upsertAffinityPeers(id, true)
    }))

    // Add to new affinities
    await Promise.all(info.affinities.filter(id => !currentInfo.affinities.includes(id)).map(async id => {
      await this.upsertAffinityPeers(id)
    }))

    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/peer:${shorten(this.peerId)}`, { name: info.name, hash: info.hash })
  }
  async getAffinities () {
    return this.dht.getJSONAsync(`gathering:${this.gathering.id}/affinities`)
  }
  async addAffinities (affinities) {
    const currentAffinities = await this.getAffinities()
    affinities = affinities.filter(x => !currentAffinities.some(y => y.name.toLowerCase() === x.name.toLowerCase() || y.id === x.id))
    if (affinities.length > 0) {
      await this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities`, currentAffinities.concat(affinities))
      await Promise.all(affinities.map(async affinity => this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities/${affinity.id}`, [])))
    }
  }
  async getAffinityPeers (affinityId) {
    return this.dht.getJSONAsync(`gathering:${this.gathering.id}/affinities/${affinityId}`)
  }
  async upsertAffinityPeers (affinityId, remove = false) {
    const peers = await this.getAffinityPeers(affinityId)
    const shortPeerId = shorten(this.peerId)
    const peerIdIndex = peers.indexOf(shortPeerId)
    if (remove && peerIdIndex !== -1) peers.splice(peerIdIndex, 1)
    else if (!remove && peerIdIndex === -1) peers.push(shortPeerId)
    else return
    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities/${affinityId}`, peers)
  }
}

export default MeshNet
