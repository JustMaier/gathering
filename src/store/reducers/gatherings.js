import * as actionTypes from '../actions/actionTypes';
import {updateState} from '../../shared/utility';

const initialState = {
  gatherings: [],
  activeGathering: null,
  loading: true,
  error: null
};

export default (state = initialState, {type, payload}) => {
  const uState = updateState(state);
  switch (type) {
    case actionTypes.NO_ACTIVE_GATHERING:
      return uState({loading: false});
    case actionTypes.LOAD_GATHERINGS:
      return uState({gatherings: payload});
    case actionTypes.JOIN_GATHERING:
      return uState({gatherings: [...state.gatherings, payload]});
    case actionTypes.ACTIVATE_GATHERING_START:
      return uState({loading: true, error: null});
    case actionTypes.ACTIVATE_GATHERING_FAIL:
      return uState({loading: false, error: payload});
    case actionTypes.ACTIVATE_GATHERING_SUCCESS:
      return uState({loading: false, activeGathering: payload});
    case actionTypes.DEACTIVATE_GATHERING:
      return uState({activeGathering: null});
    default:
      return state;
  }
};
