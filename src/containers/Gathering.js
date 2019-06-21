import React, { useState, useEffect } from 'react'
import { Button, Header } from '../components/UI'
import Me from './Me'
import Contacts from './Contacts'
import db from '../db'

const Gathering = () => {
  // TODO some way of notifying me when I get a new recommendation
  // useEffect(() => {
  //   if (recommendation) { setContacts([recommendation, ...contacts]) }
  // }, [recommendation])

  return (
    <React.Fragment>
      <Me />
      {/*
      <LeaderBoard /> */}
      <Contacts />
      <Button mt='4' as='button' sm onClick={async () => db.deactivateGathering()}>Close gathering</Button>
    </React.Fragment>
  )
}

export default Gathering
