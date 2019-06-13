import Contact from './Contact'
import { uuid } from '../shared/utility'

export default class Gathering {
  id;
  name;
  end;
  affinities = {}
  contact;
  active = false;
  starsRemaining = 3;

  constructor (data) {
    Object.assign(this, data)
    if (!this.id) this.id = uuid()
    if (!this.contact.id) this.contact.id = uuid()
    this.deserialize()
  }

  serialize () {
    return ({
      ...this,
      contact: this.contact.serialize()
    })
  }

  deserialize () {
    this.contact = new Contact(this.contact, this)
    return this
  }
}
