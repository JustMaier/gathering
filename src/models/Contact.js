import md5 from 'md5-hash';
import Flag from '../shared/Flag';
import { affinities } from './index';

export const contactFlags = {
  inactive: 1,
  notify: 2
};

export default class Contact {
  constructor(data) {
    Object.assign(this, data);
    const hash = md5((data.email || '').toLowerCase());
    this.img = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    this.flags = new Flag(data.flags || 0, contactFlags);
    this.affinities = new Flag(data.affinities || 0, affinities);
  }
  toVCard() {
    return `BEGIN:VCARD
    VERSION:3.0
    FN:${this.name}
    TEL;TYPE=work,voice:${this.phone}
    EMAIL;type=internet,pref:${this.email}
    ORG:${this.organization}
    UID:${this.id}
    END:VCARD`;
  }
  hasConnection(contactId, connections) {
    return connections.find(x=>x.fromId === this.id && x.toId === contactId) !== null;
  }
}
