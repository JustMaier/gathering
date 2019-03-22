import network from '../../network';
import { addPeer, removePeer } from '../actions/network';
import { addContact } from '../actions/contacts';
import { addConnection } from '../actions/connections';
import { MeshClientEvents } from 'simple-mesh-net';

export default ({dispatch, getState}) => {
  network.on(MeshClientEvents.PEER_CONNECT, peer => dispatch(addPeer(peer)))
  network.on(MeshClientEvents.PEER_CLOSE, peer => dispatch(removePeer(peer)))
  network.on('recommendation', (req, res) => {
    const contact = req.payload;
    const existingContact = getState().contacts.contacts.find(x=>x.id === contact.id);
    if(existingContact) res.send(false);
    else{
      dispatch(addContact(contact));
      dispatch(addConnection({
        gatheringId: network.gathering.id,
        fromId: network.gathering.contactId,
        toId: contact.id,
        recommenderId: contact.recommenderId,
        flags: contact.flags
      }));
      res.send(true);
    }
  });

  return next => action => next(action);
}
