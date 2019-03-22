import * as actionTypes from './actionTypes';

export const addPeer = (peer) => ({type: actionTypes.ADD_PEER, payload: peer});
export const removePeer = (peer) => ({type: actionTypes.REMOVE_PEER, payload: peer});
