import * as actionTypes from './actionTypes';
import db, { tables } from '../../db';
import { uuid } from '../../shared/utility';
import network from '../../network';
import { loadContacts } from './contacts';
import { loadConnections } from './connections';
import Dexie from 'dexie';

export const loadGatherings = () => async dispatch => {
  const gatherings = await db.table(tables.gatherings).toArray()
  dispatch({type: actionTypes.LOAD_GATHERINGS, payload: gatherings});
};


const addGathering = (gathering, contactInfo) => async dispatch => {
  gathering.codename = contactInfo.codename;
  gathering.contactId = contactInfo.id = uuid();
  contactInfo.gatheringId = gathering.id;

  try{
    await db.table(tables.gatherings).add(gathering);
  } catch (e){
    if(e.name === Dexie.errnames.Constraint){
      const existingGathering = await db.table(tables.gatherings).where({name: gathering.name}).first();
      if(existingGathering.id === gathering.id) return existingGathering;
      else throw e; // TODO: catch add failures due to unique gathering name constraint
    }
    throw e;
  }

  await db.table(tables.contacts).add(contactInfo)

  dispatch({ type: actionTypes.JOIN_GATHERING, payload: gathering });
  return gathering;
}

export const joinGathering = (gathering, contactInfo) => {
  return addGathering(gathering, contactInfo);
}

export const createGathering = (gathering, contactInfo) => {
  gathering.id = uuid();
  return addGathering(gathering, contactInfo);
}

const activateGatheringStart = () => ({type: actionTypes.ACTIVATE_GATHERING_START});
const activateGatheringSuccess = (gathering) => ({type: actionTypes.ACTIVATE_GATHERING_SUCCESS, payload: gathering});
// eslint-disable-next-line no-unused-vars
const activateGatheringFail = (errorMessage) => ({type: actionTypes.ACTIVATE_GATHERING_FAIL, payload: errorMessage});

export const activateGathering = (gatheringId) => async dispatch => {
  dispatch(activateGatheringStart());

  const gathering = await db.table(tables.gatherings).where('id').equals(gatheringId).first();
  await network.connect(gathering);
  localStorage.setItem('activeGatheringId', gatheringId);
  dispatch(loadContacts(gatheringId));
  dispatch(loadConnections(gatheringId));
  dispatch(activateGatheringSuccess(gathering));

  // TODO catch network connect failures
  // dispatch(activateGatheringFail());
};

export const deactivateGathering = () => async dispatch => {
  network.disconnect();
  localStorage.removeItem('activeGatheringId');
  dispatch({type: actionTypes.DEACTIVATE_GATHERING});
}

export const checkGatheringState = () => dispatch => {
  const gatheringId = localStorage.getItem('activeGatheringId');
  if(gatheringId) dispatch(activateGathering(gatheringId));
  else dispatch({type: actionTypes.NO_ACTIVE_GATHERING});
}
