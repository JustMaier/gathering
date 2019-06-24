import React, { useState, useEffect } from 'react'
import { Button, Header } from '../components/UI'
import Me from './Me'
import Contacts from './Contacts'
import db from '../db'
import Leadertiles from './Leadertiles'

const Gathering = () => {
  // TODO some way of notifying me when I get a new recommendation
  const [gathering, setGathering] = useState(db.gathering.all)
  useEffect(() => {
    db.gathering.events.on('replicated', () => setGathering(db.gathering.all))
  }, [])

  return (
    <React.Fragment>
      <Header mt='0' mb='1' fontSize='2' fontWeight='normal' color='secondary'>{gathering.name}</Header>
      <Me />
      <Leadertiles />
      <Contacts />
      <Button mt='4' as='button' sm onClick={async () => db.deactivateGathering()}>Close gathering</Button>
    </React.Fragment>
  )
}

export default Gathering
