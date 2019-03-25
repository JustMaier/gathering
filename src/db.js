import Dexie from "dexie";
import {Contact, Gathering} from './models'

class GatheringDb extends Dexie {
  gatherings;
  contacts;

  constructor(name = "gatheringDb") {
    super(name);
    const db = this;
    db.version(1).stores({
      gatherings: "&id, end, active",
      contacts: "&id, gatheringId, recommenderId, &codename, name, organization, affinities, flags, stars"
    });

    db.gatherings.mapToClass(Gathering);
    Gathering.prototype.save = function(){
      return db.gatherings.put(this.serialize());
    }
    Gathering.prototype.getContacts = function(queryFn = null){
      let contacts = db.contacts.where({gatheringId: this.id});
      if(queryFn) contacts = queryFn(contacts);
      const promise = contacts.toArray();
      promise.then(x=>x.forEach(y=>y.deserialize(this)));

      return promise;
    }
    Gathering.prototype.getContact = function(id){
      return db.transaction('r', db.contacts, async () => {
        const contact = await db.contacts.where({id}).first();
        if(contact.recommenderId) contact.recommender = await db.contacts.where({id: contact.recommenderId}).first();
        contact.deserialize(this);

        return contact;
      });
    }
    Gathering.prototype.addContact = function(data){
      const contact = new Contact(data, this);
      return contact.save();
    }
    Gathering.prototype.activate = function(){
      return db.transaction('rw', db.gatherings, async () => {
        // Deactivate any other gatherings
        const activeGatherings = await db.gatherings.where({active: 1}).toArray();
        activeGatherings.forEach(async x=> await x.deactivate());

        this.active = 1;
        await this.save();

        return this;
      });
    }
    Gathering.prototype.deactivate = function(){
      this.active = 0;
      return this.save();
    }

    db.contacts.mapToClass(Contact);
    Contact.prototype.save = function(){
      return db.contacts.put(this.serialize());
    }
  }

  getGatherings(){
    const promise = this.gatherings.toArray();
    promise.then(x=>x.forEach(y=>y.deserialize()));
    return promise;
  }
  getGathering(id){
    const promise = this.gatherings.where({id}).first();
    promise.then(x=>{
      if(x) x.deserialize()
    });
    return promise;
  }
  getActiveGathering(){
    const promise = this.gatherings.where({active: 1}).first();
    promise.then(x=>{
      if(x) x.deserialize()
    });
    return promise;
  }
}

const db = new GatheringDb();

export default db;

// db.transaction("rw", db.gatherings, db.contacts, () => {
//   db.gatherings.put({ id: 1, name: "demo", end: "2019-12-27T09:00:00", contact: {name:"Justin", affinities: 3, flags: 0}, affinities: {'Affinity1': 1, 'Affinity2': 2} });

//   db.contacts.bulkPut([
//     {
//       id: 2,
//       gatheringId: 1,
//       name: "Tianna",
//       flags: 1,
//       affinities:2
//     },
//     {
//       id: 3,
//       gatheringId: 1,
//       name: "John",
//       recommenderId: 2
//     },
//     {
//       id: 4,
//       gatheringId: 1,
//       name: "Jane",
//       recommenderId: 2
//     }
//   ]);
// });

// const test = async ()=>{
//   let gathering = await db.getActiveGathering();
//   if(!gathering){
//     const gatherings = await db.getGatherings();
//     gathering = gatherings[0];
//     await gathering.activate();
//   }

//   console.log(await gathering.getContacts());
// }

// const deactivate = async () => {
//   let gathering = await db.getActiveGathering();
//   if(gathering){
//     await gathering.deactivate();
//   }
// }

// deactivate();
// test();
