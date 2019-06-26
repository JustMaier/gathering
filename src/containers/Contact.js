/* global Blob */
import React, { useState, useEffect } from 'react'
import { ListGroup, ListGroupItem, Button, Header, Spinner, Stars, Text, Box, CIDPhoto } from '../components/UI'
import Affinities from './Affinities'
import { saveAs } from 'file-saver'
import { ContactList, ContactListItem } from '../components/ContactList'
import StatusIndicator from '../components/StatusIndicator'
import { MdPhone, MdLocationCity, MdEmail, MdCloudDownload } from 'react-icons/md'
import Recommender from '../components/Recommender'
import db from '../db'
import generateVCard from '../shared/generateVCard'

const Contact = ({ history, match: { params: { id: contactId } } }) => {
  const [recommending, setRecommending] = useState(false)
  const [contact, setContact] = useState(null)
  const [contacts, setContacts] = useState([])
  const [affinities, setAffinities] = useState([])
  const [recommendations, setRecommendations] = useState({})
  useEffect(() => {
    const updateContact = () => {
      setContact(db.getContact(contactId))
      setAffinities(db.getAffinitiesFor(contactId))
    }
    db.gathering.events.on('replicated', updateContact)
    updateContact()

    return () => {
      db.gathering.events.off('replicated', updateContact)
    }
  }, [])
  useEffect(() => {
    if (recommending && contacts.length === 0) setContacts(db.getContacts())
  }, [recommending])

  const download = async () => {
    const blob = new Blob([generateVCard(contact, db.gathering.all, contact.avatar ? await db.getImageFromCid(contact.avatar) : null)], { type: 'text/vcard' })
    saveAs(blob, `${contact.name}.vcf`)
  }
  const toggleRecommending = () => setRecommending(x => !x)
  const deleteContact = async () => {
    await db.deleteContact(contactId)
    history.replace('/')
  }
  const addStar = async () => {
    const stars = await db.addStar(contactId)
    setContact({ ...contact, stars })
  }
  const sendRecommendation = async (recommendedContactId) => {
    setRecommendations(x => ({ ...x, [recommendedContactId]: 'sending' }))
    await db.sendRecommendation(contactId, recommendedContactId)
    setRecommendations(x => ({ ...x, [recommendedContactId]: 'sent' }))
  }

  if (!contact) { return <Spinner /> }

  const isOnline = contact // && peers[contact.id]

  return (
    <div>
      <Box justifyContent='space-between'>
        <StatusIndicator isOnline={isOnline} />
        <Recommender contact={contact} />
        <Stars count={contact.stars} onClick={db.starsAvailable > 0 ? addStar : null} />
      </Box>
      <Box alignItems='center' justifyContent='center' mb={4} mt={2}>
        <CIDPhoto src={contact.avatar} alt={contact.name} />
      </Box>
      <Box alignItems='center'>
        <Box flex='1' flexDirection='column'>
          <Header>{contact.name}</Header>
          <Text>{contact.organization}</Text>
        </Box>
        <Button as='button' sm onClick={download}><MdCloudDownload /></Button>
      </Box>

      <ListGroup mt={4} mb={4}>
        {contact.email && <ListGroupItem as='a' href={`mailto:${contact.email}`}><MdEmail />{contact.email}</ListGroupItem>}
        {contact.phone && <ListGroupItem as='a' href={`tel:${contact.phone}`}><MdPhone />{contact.phone}</ListGroupItem>}
        {contact.location && <ListGroupItem as='div'><MdLocationCity />{contact.location}</ListGroupItem>}
      </ListGroup>
      <Affinities value={affinities} mb='3' />
      <Button as='button' mb='3' block onClick={deleteContact} bg='danger'>Delete</Button>
      <Button as='button' mb='4' block onClick={toggleRecommending}>Send Recommendation</Button>
      {recommending && (
        <ContactList mb='4'>
          {contacts.filter(x => x.id !== contact.id).map(x => <ContactListItem key={x.id} {...x} onClick={sendRecommendation} status={recommendations[x.id]} />)}
        </ContactList>
      )}
    </div>
  )
}

export default Contact
