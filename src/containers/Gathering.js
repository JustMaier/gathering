import React, { useState, useEffect } from 'react'
import { useGatheringContext } from '../contexts'
import { Button } from '../components/UI';
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
      <ContactList>
        {contacts.map(x=><ContactListItem key={x.id} {...x} />)}
      </ContactList>
      <Button as="button" sm onClick={actions.deactivate}>Close gathering</Button>
      <Button href={`/gatherings/join?id=${gathering.id}&name=${gathering.name}&end=${gathering.end}`}>Share</Button>
    </React.Fragment>
  )
}

export default Gathering;
