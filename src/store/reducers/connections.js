import * as actionTypes from '../actions/actionTypes';
import {updateState} from '../../shared/utility';

const initialState = {
  connections: [],
  awards: null,
  loading: false,
  error: null
};

export default (state = initialState, {type, payload}) => {
  const uState = updateState(state);
  switch (type) {
    case actionTypes.LOAD_CONNECTIONS:
      return uState({connections: payload});
    case actionTypes.ADD_CONNECTION:
      return uState({connections: [...state.connections, payload]});
    case actionTypes.UPDATE_CONNECTION:
      return uState({connections: state.connections.map(x=> x.toId === payload.id ? {...x, ...payload} : x)});
    case actionTypes.REMOVE_CONNECTION:
      return uState({connections: state.connections.filter(x=>x.toId !== payload && x.fromId !== payload)});
    case actionTypes.UPDATE_AWARDS_START:
      return uState({loading: true, error: null});
    case actionTypes.UPDATE_AWARDS_SUCCESS:
      return uState({loading: false});
    case actionTypes.UPDATE_AWARDS_FAIL:
      return uState({loading: false, error: payload});
    case actionTypes.LOAD_AWARDS:
      return uState({awards: payload});
    case actionTypes.ADD_STAR_TO_CONNECTION:
      return uState({connections: state.connections.map(x => x.toId === payload ? {...x, stars: x.stars + 1} : x)})
    default:
      return state;
  }
};
