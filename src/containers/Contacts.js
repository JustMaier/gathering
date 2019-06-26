import React, { useState } from 'react'
import { Header } from '../components/UI'
import { ContactList, ContactListItem } from '../components/ContactList'
import db from '../db'

const Contacts = () => {
  const [contacts] = useState(db.getContacts())
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
