import * as actionTypes from './actionTypes';
import db, { tables } from '../../db';
import network from '../../network';
import { addConnection, addStarToConnection, removeConnection } from './connections';

export const loadContacts = (gatheringId) => async dispatch => {
  const contacts = await db.table(tables.contacts).where({gatheringId}).toArray();
  dispatch({type: actionTypes.LOAD_CONTACTS, payload: contacts})
};

export const connectInit = () => ({type: actionTypes.CONNECT_INIT});
const connectStart = () => ({type: actionTypes.CONNECT_START});
const connectSuccess = () => ({type: actionTypes.CONNECT_SUCCESS});
// eslint-disable-next-line no-unused-vars
const connectFail = (errorMessage) => ({type: actionTypes.CONNECT_FAIL, payload: errorMessage});
export const connect = (codename) => async (dispatch, getState) => {
  dispatch(connectStart());
  const contactId = getState().gatherings.activeGathering.contactId;
  const myInfo = getState().contacts.contacts.find(x=>x.id === contactId);
  const { contact, connection } = await network.swapContactInfo(codename, myInfo);
  // TODO handle existing recommendation
  dispatch(connectSuccess());
  dispatch(addContact(contact));
  dispatch(addConnection(connection));
  // TODO catch swap contact info failure
  //dispatch(connectFail)
}

const recommendStart = () => ({type: actionTypes.RECOMMEND_START});
const recommendSuccess = () => ({type: actionTypes.RECOMMEND_SUCCESS});
// eslint-disable-next-line no-unused-vars
const recommendFail = (errorMessage) => ({type: actionTypes.RECOMMEND_FAIL, payload: errorMessage});
export const recommend = (toContactId, forContactId) => async dispatch => {
  dispatch(recommendStart());
  const contact = await db.table(tables.contacts).where({id: forContactId}).first();
  const { connection } = await network.recommendContact(toContactId, contact);
  dispatch(addConnection(connection));
  dispatch(recommendSuccess());
  // TODO catch recommend contact info failure
  //dispatch(recommendFail)
}

export const addContact = (contact) => async (dispatch, getState) => {
  const {id, recommenderId} = getState().contacts.contacts.find(x=>x.id === contact.id) || {};
  if(id != null){
    //Be sure to keep the recommenderId when updating contact info
    const updates = {...contact, recommenderId};
    await db.table(tables.contacts).where({id}).modify(updates);
    dispatch({type: actionTypes.UPDATE_CONTACT, payload: updates});
  } else {
    await db.table(tables.contacts).add(contact);
    dispatch({type: actionTypes.ADD_CONTACT, payload: contact});
  }
}

export const updateContact = (contact) => async dispatch => {
  await db.table(tables.contacts).update(contact.id, contact);
  dispatch({type: actionTypes.UPDATE_CONTACT, payload: contact});
}

export const removeContact = (contactId) => async dispatch => {
  await db.table(tables.contacts).where({id: contactId}).delete();
  dispatch(removeConnection(contactId));
  dispatch({type: actionTypes.REMOVE_CONTACT, payload: contactId});
}

export const addStar = (contactId) => async dispatch => {
  await db.table(tables.contacts).where({id: contactId}).modify(x=>x.stars += 1);
  dispatch(addStarToConnection(contactId));
  network.addStar(contactId);
  dispatch({type: actionTypes.ADD_STAR, payload: contactId});
}
