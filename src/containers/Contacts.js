import React, { useState, useEffect } from 'react'
import { Header } from '../components/UI'
import { ContactList, ContactListItem } from '../components/ContactList'
import db from '../db'

const Contacts = () => {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    const updateContacts = () => setContacts(db.getContacts())
    db.gathering.events.on('replicated', updateContacts)
    updateContacts()

    return () => {
      if (db.gathering) db.gathering.events.off('replicated', updateContacts)
    }
  }, [])

  if (contacts.length === 0) return null
  return (
    <React.Fragment>
      <Header fontSize='3' mt='5' mb='1'>Your contacts</Header>
      <ContactList>
        {contacts.map(x => <ContactListItem key={x.id} {...x} />)}
      </ContactList>
    </React.Fragment>
  )
}

export default Contacts
