import * as actionTypes from './actionTypes';
import db, { tables } from '../../db';
import network from '../../network';
import { computeAwards } from '../../shared/awards';

export const loadConnections = (gatheringId) => dispatch => {
  db.table(tables.connections)
    .where({gatheringId})
    .toArray()
    .then(connections => dispatch({type: actionTypes.LOAD_CONNECTIONS, payload: connections}));
};

const updateAwardsStart = () => ({type: actionTypes.UPDATE_AWARDS_START})
const updateAwardsSuccess = () => ({type: actionTypes.UPDATE_AWARDS_SUCCESS})
// eslint-disable-next-line no-unused-vars
const updateAwardsFail = (errorMessage) => ({type: actionTypes.UPDATE_AWARDS_FAIL, payload: errorMessage})
export const updateAwards = () => async (dispatch, getState) => {
  dispatch(updateAwardsStart());
  const awards = await computeAwards(getState().connections.connections);
  await network.announceAwards(awards);
  dispatch(updateAwardsSuccess());
  // TODO catch failure
  // dispatch(updateAwardsFail(errorMessage));
}

export const loadAwards = (awards) => ({type: actionTypes.LOAD_AWARDS, payload: awards});

export const addConnection = (connection) => async (dispatch, getState) => {
  const {gatherindId, toId, fromId} = getState().connections.connections.find(x=>x.fromId === connection.fromId && x.toId === connection.toId) || {};
  if(toId != null) {
    const updates = {flags: connection.flags, stars: connection.stars};
    await db.table(tables.connections).where({gatherindId, toId, fromId}).modify(updates);
    dispatch({type: actionTypes.UPDATE_CONNECTION, payload: updates});
  } else {
    await db.table(tables.connections).add(connection);
    dispatch({type: actionTypes.ADD_CONNECTION, payload: connection});
  }
}

export const removeConnection = (contactId) => async dispatch => {
  await db.table(tables.connections).where({toId: contactId}).delete();
  await db.table(tables.connections).where({fromId: contactId}).delete();
  dispatch({type: actionTypes.REMOVE_CONNECTION, payload: contactId});
}

export const addStarToConnection = (contactId) => async dispatch => {
  await db.table(tables.connections).where({toId: contactId}).modify(x=>x.stars += 1);
  network.addStar(contactId);
  dispatch({type: actionTypes.ADD_STAR_TO_CONNECTION, payload: contactId});
}
