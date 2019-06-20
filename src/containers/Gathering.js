import React, { useState, useEffect } from 'react'
import { useGatheringContext, useNetworkContext } from '../contexts'
import { Button, Header } from '../components/UI'
import Me from '../components/Me'
import { ContactList, ContactListItem } from '../components/ContactList'

const Gathering = () => {
  const { gathering, actions } = useGatheringContext()
  const network = useNetworkContext()
  const [contacts, setContacts] = useState([])
  useEffect(() => {
    gathering.getContacts().then(setContacts)
    network.getConnections().then(connections => console.log(connections)).catch(err => console.log(err))
  }, [gathering])
  // TODO some way of notifying me when I get a new recommendation
  // useEffect(() => {
  //   if (recommendation) { setContacts([recommendation, ...contacts]) }
  // }, [recommendation])

  return (
    <React.Fragment>
      <Me {...gathering.contact} />
      {contacts.length > 0 && (
        <React.Fragment>
          <Header fontSize='3' mt='5' mb='1'>Your contacts</Header>
          <ContactList>
            {contacts.map(x => <ContactListItem key={x.id} {...x} />)}
          </ContactList>
        </React.Fragment>
      )}
      <Button mt='4' as='button' sm onClick={actions.deactivate}>Close gathering</Button>
    </React.Fragment>
  )
}

export default Gathering
