import React, { useState, useEffect } from 'react'
import { useGatheringContext } from '../contexts'
import { Button, Header } from '../components/UI';
import Me from '../components/Me';
import { ContactList, ContactListItem } from '../components/ContactList';

const Gathering = () => {
  const { gathering, actions } = useGatheringContext();
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    gathering.getContacts().then(setContacts)
  }, [gathering]);

  return (
    <React.Fragment>
      <Me {...gathering.contact} />
      <Header fontSize="3" mt="5" mb="1">Your contacts</Header>
      <ContactList mb="4">
        {contacts.map(x=><ContactListItem key={x.id} {...x} />)}
      </ContactList>
      <Button as="button" sm onClick={actions.deactivate}>Close gathering</Button>
    </React.Fragment>
  )
}

export default Gathering;
