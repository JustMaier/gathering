import Dexie from 'dexie';

const db = new Dexie('gatheringDB');
db.version(1).stores({
  gatherings: '&id, &name, end, codename, contactId',
  contacts: '&id, gatheringId, recommenderId, name, organization, email, phone, location, affinities, flags, stars',
  connections: '[gatheringId+fromId+toId], gatheringId, fromId, toId, recommenderId, flags, stars'
})


export const tables = {
  gatherings: 'gatherings',
  contacts: 'contacts',
  connections: 'connections'
};

export default db;
