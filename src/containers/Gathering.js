import React, { useState, useEffect } from 'react'
import { Button, Header, Box, Text, LinkButton } from '../components/UI'
import { timeLeft } from '../shared/utility'
import Me from './Me'
import Contacts from './Contacts'
import db from '../db'
import Leadertiles from './Leadertiles'
import { MdSettings } from 'react-icons/md'

const Gathering = () => {
  // TODO some way of notifying me when I get a new recommendation
  const [gathering, setGathering] = useState(db.gathering.all)
  useEffect(() => {
    db.gathering.events.on('replicated', () => setGathering(db.gathering.all))
  }, [])

  return (
    <React.Fragment>
      <Box mt='0' mb='1'>
        <Header fontSize='2' fontWeight='normal' color='secondary'>{gathering.name}: {gathering.place}</Header>
        <Text ml='auto' color='muted'>{timeLeft(gathering.end) || 'Ended'}</Text>
      </Box>
      <Me />
      <Leadertiles />
      <Contacts />
      <Box mt='4'>
        <Button as='button' sm onClick={async () => db.deactivateGathering()}>Close gathering</Button>
        <LinkButton ml='auto' sm to='/debug'><MdSettings /></LinkButton>
      </Box>
    </React.Fragment>
  )
}

export default Gathering
