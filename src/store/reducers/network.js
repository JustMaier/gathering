import * as actionTypes from '../actions/actionTypes';
import {updateState} from '../../shared/utility';

const initialState = {
  peers: [],
};

export default (state = initialState, {type, payload}) => {
  const uState = updateState(state);
  switch (type) {
    case actionTypes.ADD_PEER:
      return uState({peers: [...state.peers, payload]});
    case actionTypes.REMOVE_PEER:
      return uState({peers: state.peers.filter(x=>x.peerName !== payload.peerName)});
    default:
      return state;
  }
};
