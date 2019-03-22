import * as actionTypes from '../actions/actionTypes';
import {updateState} from '../../shared/utility';
import { Contact } from '../../models';

const initialState = {
  contacts: [],
  loading: false,
  connected: false,
  error: null
};

const prepareContact = contact => new Contact(contact);

export default (state = initialState, {type, payload}) => {
  const uState = updateState(state);
  switch (type) {
    case actionTypes.LOAD_CONTACTS:
      return uState({contacts: payload.map(prepareContact)});
    case actionTypes.CONNECT_INIT:
      return uState({loading: false, error: null, connected: false});
    case actionTypes.RECOMMEND_START:
    case actionTypes.CONNECT_START:
      return uState({loading: true, error: null});
    case actionTypes.RECOMMEND_SUCCESS:
      return uState({loading: false});
    case actionTypes.CONNECT_SUCCESS:
      return uState({loading: false, connected: true});
    case actionTypes.RECOMMEND_FAIL:
    case actionTypes.CONNECT_FAIL:
      return uState({loading: false, error: payload});
    case actionTypes.ADD_CONTACT:
      return uState({contacts: [...state.contacts, prepareContact(payload)]});
    case actionTypes.REMOVE_CONTACT:
      return uState({contacts: state.contacts.filter(x=>x.id !== payload)});
    case actionTypes.UPDATE_CONTACT:
      return uState({contacts: state.contacts.map(x=> x.id === payload.id ? {...x, ...payload} : x)});
    case actionTypes.ADD_STAR_TO_CONNECTION:
      return uState({contacts: state.contacts.map(x => x.id === payload ? {...x, stars: x.stars + 1} : x)})
    default:
      return state;
  }
};
