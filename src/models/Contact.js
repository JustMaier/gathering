import md5 from 'md5-hash';
import Flag from './infrastructure/Flag';

export const contactFlags = {
  active: 1
}

export default class Contact {
  id;
  codename;
  gatheringId;
  recommenderId;
  recommender;
  name;
  img;
  organization;
  email;
  phone;
  location;
  affinities;
  notes;
  flags = new Flag(0, contactFlags);
  stars = 0;

  constructor(data, gathering) {
    Object.assign(this, data);
    this.gatheringId = gathering.id;
    this.deserialize(gathering);
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

  serialize(){
    const serialized = {
      ...this,
      flags: this.flags.value,
      affinities: this.affinities.value
    };
    delete serialized.recommender;
    delete serialized.img;
    return serialized;
  }

  deserialize(gathering){
    this.stars = isNaN(this.stars) ? 0 : this.stars;
    this.flags = new Flag(this.flags || 0, contactFlags);
    this.affinities = new Flag(this.affinities || 0, gathering.affinities);
    if(this.recommender) this.recommender.deserialize(gathering);
    const hash = md5((this.email || '').toLowerCase());
    this.img = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

    return this;
  }
}
