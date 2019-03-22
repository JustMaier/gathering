import {contactFlags} from './models/Contact';
import MeshClient from 'simple-mesh-net';

const swapContact = {
  receive: (channel, contact) =>
    new Promise((resolve, reject) => {
      console.log('listen', channel);
      network.on(channel, (peer, req, res) => {
        res.send(contact);
        resolve(req.payload);
      });
    }),
    send: (channel, contact) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('send', channel);
        network.broadcast(channel, contact).then(responseData => {
          resolve(responseData);
        })
      }, 2000); //Wait 500ms to make sure that the listener is ready
    })
};

class MeshNet {
  gathering = null;
  client = null;
  async connect(gathering) {
    this.gathering = gathering;
    this.client = new MeshClient(gathering.contactId, {
      signalServer: 'ws://localhost:9090'
    });

    this.send = this.client.send.bind(this.client);
    this.broadcast = this.client.broadcast.bind(this.client);
    this.on = this.client.on.bind(this.client);
    this.once = this.client.once.bind(this.client);
    this.off = this.client.off.bind(this.client);

    this.toBind.forEach(({type, handler, as}) => {
      this.client[as](type, handler);
    });
  }
  disconnect() {
    console.warning('disconnect not implemented');
  }
  async swapContactInfo(codename, myInfo) {
    const channelParts = [this.gathering.codename.toLowerCase(), codename.toLowerCase()].sort();
    const channel = channelParts.join(':');
    const method =
      channelParts[0] === this.gathering.codename.toLowerCase() ? 'send' : 'receive';

    //TODO listen for failures here
    const contact = await swapContact[method](channel, myInfo);

    // publish connection
    const connection = {
      gatheringId: this.gathering.id,
      fromId: this.gathering.contactId,
      toId: contact.id,
      flags: 0
    };
    this.broadcast('connection', connection);

    return {contact, connection};
  }
  addStar(contactId) {
    this.broadcast('add-star', contactId);
  }
  async recommendContact(toContactId, contact) {
    // send contact
    const didntHaveAlready = await this.send(toContactId, 'recommendation', contact);
    const connection = {
      gatheringId: this.gathering.id,
      fromId: toContactId,
      toId: contact.id,
      recommenderId: this.gathering.contactId,
      flags: contactFlags.inactive
    };
    if(didntHaveAlready) this.broadcast('connection', connection);

     return {didntHaveAlready, connection};
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
  send = async (peerName, type, data, timeout = undefined) => {}
  broadcast = async (type, data, filterFn = null, timeout = undefined) => {}
}

const network = new MeshNet();
export default network;
