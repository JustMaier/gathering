import React, { useEffect, useState } from 'react'
import { Header, Box } from '../components/UI'
import { ContactList, ContactListItem } from '../components/ContactList'
import db from '../db'

const Requests = ({ ...props }) => {
  const [requests, setRequests] = useState([])
  useEffect(() => {
    const updateRequests = () => db.getRequests().then(setRequests)
    db.my.connectionRequests.events.on('write', updateRequests)
    db.my.connectionRequests.events.on('replicated', updateRequests)
    updateRequests()

    return () => {
      db.my.connectionRequests.events.off('write', updateRequests)
      db.my.connectionRequests.events.off('replicated', updateRequests)
    }
  }, [])

  if (requests.length === 0) return null

  return (
    <Box flexDirection='column' {...props}>
      <Header fontSize='3' mb='1'>Connection Requests</Header>
      <ContactList>
        {requests.map(x => <ContactListItem key={x.id} {...x} onApprove={() => db.acceptRequest(x.id)} onDecline={() => db.declineRequest(x.id)} />)}
      </ContactList>
    </Box>
  )
}

export default Requests
