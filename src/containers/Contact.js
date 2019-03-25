import React, { useState, useEffect } from 'react'
import {ListGroup, ListGroupItem, Button, Header, Spinner, Stars} from '../components/UI';
import { saveAs } from 'file-saver';
import { ContactList, ContactListItem } from '../components/ContactList';
import { useGatheringContext, useNetworkContext } from '../contexts'

const Contact = ({history, match: { params } }) => {
  const { gathering, actions } = useGatheringContext();
  const { peers, actions: networkActions } = useNetworkContext();
  const [recommending, setRecommending] = useState(false);
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [recommendations, setRecommendations] = useState({});

  useEffect(() => {
    gathering.getContact(params.id).then(setContact)
  }, [gathering]);
  useEffect(() => {
    if(recommending && contacts.length === 0)
      gathering.getContacts().then(setContacts);
  }, [gathering, recommending]);

  const download = () => {
    const blob = new Blob([contact.toVCard()], {type:'text/vcard'});
    saveAs(blob, `${contact.name}.vcf`);
  }
  const toggleRecommending = () => setRecommending(x=>!x);
  const deleteContact = () => {
    actions.removeContact(contact.id);
    history.push('/');
  }
  const sendRecommendation = async (recommendedContactId) => {
    setRecommendations(x=>({...x, [recommendedContactId]: 'sending'}));
    const recommendedContact = await gathering.getContact(recommendedContactId);
    await networkActions.recommend(contact.id, recommendedContact);
    setRecommendations(x=>({...x, [recommendedContactId]: 'sent'}));
  }

  if(!contact)
    return <Spinner/>

  const isOnline = contact && peers[contact.id];

  return (
    <div>
      {contact.recommender && <div>Recommended by {contact.recommender.name}</div>}
      <span>{isOnline ? 'online' : 'offline'}</span>
      <Stars count={contact.stars}/>
      <img src={contact.img+'&size=300'} alt={contact.name} />
      <Header>{contact.name}</Header>
      <p>{contact.organization}</p>
      <ListGroup>
        <ListGroupItem as="a" href={`mailto:${contact.email}`}>{contact.email}</ListGroupItem>
        <ListGroupItem as="a" href={`tel:${contact.phone}`}>{contact.phone}</ListGroupItem>
        <ListGroupItem as="div">{contact.location}</ListGroupItem>
        <ListGroupItem as="div">{contact.affinities.toString()}</ListGroupItem>
      </ListGroup>
      <Button as="button" block onClick={download}>Download</Button>
      <Button as="button" block onClick={toggleRecommending} disabled={!isOnline}>Send Recommendation</Button>
      <Button as="button" block danger onClick={deleteContact}>Delete</Button>
      {recommending && (
        <ContactList>
          {contacts.filter(x=>x.id !== contact.id).map(x=><ContactListItem key={x.id} {...x} onSelect={sendRecommendation} status={recommendations[x.id]}/>)}
        </ContactList>
      )}
    </div>
  )
}

export default Contact;
