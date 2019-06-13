import DataNode from '../../p2p/libp2p-json-node/src/index'
import md5 from 'md5-hash'

const swapContact = {
  listen: (channel, contact) => {
    console.log('listen', channel.topic)
    channel.once('connect', (message, res) => {
      if (message.data.toLowerCase() === contact.codename.toLowerCase()) res.send(contact)
      else res.send(null)
      network.unsubscribe(channel.topic)
    })
  },
  request: (channel, codename) => {
    const pingWithCodename = async (resolve, reject, attempts) => {
      try {
        console.log('send', channel.topic, attempts)
        const contact = await channel.publishWithResponse('connect', codename, 1000)
        resolve(contact)
      } catch (e) {
        if (attempts >= 10) reject('Could not reach someone with that codename')
        else pingWithCodename(resolve, reject, attempts + 1)
      }
    }

    return new Promise((resolve, reject) => pingWithCodename(resolve, reject, 1))
  }
}

class MeshNet extends DataNode {
  gathering;

  static async create ({ options } = {}) {
    const node = await super.create({
      signalServer: process.env.REACT_APP_SIGNALSERVER,
      config: {
        peerDiscovery: { autoDial: false }
      },
      ...options
    })

    return node
  }

  start (gathering) {
    this.gathering = gathering
    this.protocol = `/gathering/1.0.0/${gathering.id.substring(0, 5)}`
    super.start()
  }

  stop () {
    this.gathering = null
    super.stop()
  }

  async createGathering (gathering, affinities) {
    // Instantiate gathering DHT values
    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/connections`, [])
    await this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities`, affinities)
    await Promise.all(affinities.map(async x => {
      await this.dht.putJSONAsync(`gathering:${this.gathering.id}/affinities/${x.id}`, [])
    }))
  }
  async swapContactInfo (codename) {
    const channelParts = [this.gathering.contact.codename.toLowerCase(), codename.toLowerCase()].sort()
    const topic = md5(channelParts.join(':'))

    const channel = this.subscribe(topic)
    swapContact.listen(channel, this.gathering.contact.serialize())
    const contact = await swapContact.request(channel, codename)
    const [a, b] = [this.peerId, contact.peerId].sort()
    this.upsertConnection({ a, b, active: true }, ['active'])
    return contact
  }
  async getConnections () {
    return this.dht.getJSONAsync(`gathering:${this.gathering.id}/connections`)
  }
  async getConnection (peerId) {
    const [a, b] = [peerId, this.peerId].sort()
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
    const isA = connection.a === peerId
    connection.stars[isA ? 0 : 1]++
    return this.upsertConnection(connection, ['stars'])
  }
  async recommendContact (peerId, toId) {
    const connections = await this.getConnections()
    const [a, b] = [peerId, toId].sort()
    const targetIndex = connections.findIndex(x => x.a === a && x.b === b)
    if (!targetIndex) this.upsertConnection({ a, b, via: this.peerId, active: false })
  }
  async getRecommendations () {
    const connections = await this.getConnections()
    return connections.filter(x => (x.a === this.peerId || x.b === this.peerId) && x.via && !x.active)
  }
  async getPublicInfo (peerId) {
    return this.dht.getJSONAsync(`/gathering:${this.gathering.id}/peer:${peerId}`)
  }
  async updatePublicInfo (info) {
    let currentInfo = { affinities: [] }
    try {
      currentInfo = await this.getPublicInfo(this.peerId)
    } catch {}

    // Remove from removed affinities
    await Promise.all(currentInfo.affinities.filter(id => !info.affinities.includes(id)).map(async id => {
      await this.upsertAffinityPeers(id, this.peerId, true)
    }))

    // Add to new affinities
    await Promise.all(info.affinities.filter(id => !currentInfo.affinities.includes(id)).map(async id => {
      await this.upsertAffinityPeers(id, this.peerId)
    }))

    await this.dht.putJSONAsync(`/gathering:${this.gathering.id}/peer:${this.peerId}`, info)
  }
  async getAffinities () {
    return this.dht.getJSONAsync(`/gathering:${this.gathering.id}/affinities`)
  }
  async addAffinity (affinity) {
    const affinities = await this.getAffinities()
    if (!affinities.find(x => x.name.toLowerCase() === affinity.name.toLowerCase() || x.id === affinity.id)) {
      affinities.push(affinity)
      await this.dht.putJSONAsync(`/gathering:${this.gathering.id}/affinities`, affinities)
      await this.dht.putJSONAsync(`/gathering:${this.gathering.id}/affinities/${affinity.id}`, [])
    }
  }
  async getAffinityPeers (affinityId) {
    return this.dht.getJSONAsync(`/gathering:${this.gathering.id}/affinities/${affinityId}`)
  }
  async upsertAffinityPeers (affinityId, peerId, remove = false) {
    const peers = this.getAffinityPeers(affinityId)
    const peerIdIndex = peers.indexOf(peerId)
    if (remove && peerIdIndex !== -1) peers.splice(peerIdIndex, 1)
    else if (!remove && peerIdIndex === -1) peers.push(peerId)
    else return
    await this.dht.putJSONAsync(`/gathering:${this.gathering.id}/affinities/${affinityId}`, peers)
  }
}

const network = new MeshNet()
export default network
