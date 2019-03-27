import MeshClient from 'simple-mesh-net';
import md5 from 'md5-hash';

const swapContact = {
  listen: (channel, contact) => {
    console.log('listen', channel);
    network.once(channel, (peer, req, res) => {
      if(req.payload.toLowerCase() === contact.codename.toLowerCase()){
        res.send(contact);
      } else res.send(null);
    });
  },
  request: (channel, codename) => {
    const pingWithCodename = async (resolve, reject, attempts) => {
      try {
        console.log('send', channel, attempts);
        const contact = await network.broadcast(channel, codename, null, 1000);
        resolve(contact);
      } catch (e){
        if(attempts >= 10) reject('Could not reach someone with that codename');
        else pingWithCodename(resolve, reject, attempts + 1);
      }
    }

    return new Promise((resolve, reject) => pingWithCodename(resolve, reject, 1));
  }
};



class MeshNet {
  gathering = null;
  client = null;
  async connect(gathering) {
    this.gathering = gathering;
    this.client = new MeshClient(gathering.contact.id, {
      signalServer: 'ws://localhost:9090'
    });

    this.send = this.client.send.bind(this.client);
    this.broadcast = this.client.broadcast.bind(this.client);
    this.on = this.client.on.bind(this.client);
    this.once = this.client.once.bind(this.client);
    this.off = this.client.off.bind(this.client);
    this.emit = this.client.emit.bind(this.client);

    this.toBind.forEach(({type, handler, as}) => {
      this.client[as](type, handler);
    });

    this.on('recommendation', async (peer, req, res) => {
      const recommender = await this.gathering.getContact(peer.peerName);
      if(!recommender) return res.send(false); // Don't accept recommendations from non-contacts
      const existingContact = await this.gathering.getContact(req.payload.id);
      if(existingContact) return res.send(false); // Don't accept if we're already connected

      const contact = await this.gathering.addContact(req.payload);
      this.emit('recommendation-received', contact);
      res.send(true);
    })
  }
  disconnect() {
    console.log('disconnect not implemented');
    this.emit('disconnect');
  }
  async swapContactInfo(codename) {
    const channelParts = [this.gathering.contact.codename.toLowerCase(), codename.toLowerCase()].sort();
    const channel = md5(channelParts.join(':'));

    //TODO listen for failures here
    swapContact.listen(channel, this.gathering.contact.serialize());
    try {
      const contact = await swapContact.request(channel, codename);
      return contact;
    } catch(rejection) {
      this.off(channel);
      throw rejection;
    }
  }
  addStar(contactId) {
    this.broadcast('add-star', contactId);
  }
  async recommendContact(toContactId, contact) {
    // send contact
    const didntHaveAlready = await this.send(toContactId, 'recommendation', contact.serializeForRecommendation(this.gathering));
    return didntHaveAlready;
  }
  async announceAwards(awards) {
    // publish current awards
  }

  // These are just placeholders for reference
  // They are overriden by the MeshClient
  toBind = [];
  on = (type, handler) => {
    this.toBind.push({type, handler, as: 'on'});
  }
  once = (type, handler) => {
    this.toBind.push({type, handler, as: 'once'});
  }
  off = (type, handler = null) => {}
  emit = (type, ...args) => {};
  send = async (peerName, type, data, timeout = undefined) => {}
  broadcast = async (type, data, filterFn = null, timeout = undefined) => {}
}

const network = new MeshNet();
export default network;
