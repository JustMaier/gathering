/* global Blob */
import React, { useState, useEffect } from 'react'
import { ListGroup, ListGroupItem, Button, Header, Spinner, Stars, Text, Box, Photo } from '../components/UI'
import { saveAs } from 'file-saver'
import { ContactList, ContactListItem } from '../components/ContactList'
import StatusIndicator from '../components/StatusIndicator'
import { useGatheringContext, useNetworkContext } from '../contexts'
import { MdPhone, MdLocationCity, MdLocalOffer, MdEmail, MdCloudDownload } from 'react-icons/md'
import { contactFlags } from '../models'
import Recommender from '../components/Recommender'

const Contact = ({ history, match: { params } }) => {
  const { gathering } = useGatheringContext()
  const { peers, actions: networkActions } = useNetworkContext()
  const [recommending, setRecommending] = useState(false)
  const [contact, setContact] = useState(null)
  const [contacts, setContacts] = useState([])
  const [recommendations, setRecommendations] = useState({})

  useEffect(() => {
    gathering.getContact(params.id).then(setContact)
  }, [gathering])
  useEffect(() => {
    if (recommending && contacts.length === 0) { gathering.getContacts().then(setContacts) }
  }, [gathering, recommending])

  const download = () => {
    const blob = new Blob([contact.toVCard()], { type: 'text/vcard' })
    saveAs(blob, `${contact.name}.vcf`)
  }
  const toggleRecommending = () => setRecommending(x => !x)
  const deleteContact = () => {
    gathering.removeContact(contact.id)
    history.replace('/')
  }
  const addStar = async () => {
    await gathering.giveStar(contact)
    setContact({ ...contact, stars: contact.stars })
  }
  const sendRecommendation = async (recommendedContactId) => {
    setRecommendations(x => ({ ...x, [recommendedContactId]: 'sending' }))
    const recommendedContact = await gathering.getContact(recommendedContactId)
    await networkActions.recommend(contact.id, recommendedContact)
    setRecommendations(x => ({ ...x, [recommendedContactId]: 'sent' }))
  }

  if (!contact) { return <Spinner /> }

  const isOnline = contact && peers[contact.id]

  return (
    <div>
      <Box justifyContent='space-between'>
        <StatusIndicator isOnline={isOnline} />
        <Recommender contact={contact} />
        <Stars count={contact.stars} onClick={gathering.starsRemaining ? addStar : null} />
      </Box>
      <Box alignItems='center' justifyContent='center' mb={4} mt={2}>
        <Photo src={contact.img + '&size=300'} alt={contact.name} />
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
        <ListGroupItem as='div'><MdLocalOffer />{contact.affinities.toString()}</ListGroupItem>
      </ListGroup>
      <Button as='button' mb='3' block onClick={deleteContact} bg='danger'>Delete</Button>
      {contact.flags.hasFlag(contactFlags.active) && <Button as='button' mb='4' block onClick={toggleRecommending} disabled={!isOnline}>Send Recommendation</Button>}
      {recommending && (
        <ContactList mb='4'>
          {contacts.filter(x => x.id !== contact.id).map(x => <ContactListItem key={x.id} {...x} onSelect={sendRecommendation} status={recommendations[x.id]} />)}
        </ContactList>
      )}
    </div>
  )
}

export default Contact
