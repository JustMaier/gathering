import { combineReducers } from 'redux';
import connectionsReducer from './connections';
import gatheringsReducer from './gatherings';
import contactsReducer from './contacts';
import networkReducer from './network';

export default combineReducers({
  connections: connectionsReducer,
  gatherings: gatheringsReducer,
  contacts: contactsReducer,
  network: networkReducer
});
