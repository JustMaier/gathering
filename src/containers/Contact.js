import React, { Component } from 'react'
import { connect } from 'react-redux'
import { recommend, addStar, removeContact } from '../store/actions/contacts';
import Header from '../components/UI/Header'
import {LinkList, LinkListItem} from '../components/UI/LinkList';
import Button from '../components/UI/Button';
import { saveAs } from 'file-saver';
import { ContactList, ContactListItem } from '../components/ContactList';

export class Contact extends Component {
  state = {
    recommender: null,
    recommending: false
  };

  componentDidMount(){
    const { contact, contacts } = this.props;
    this.setState({
      recommender: contact.recommenderId ? contacts.find(x=>x.id === contact.recommenderId) : null
    });
  }

  download = () => {
    const { contact } = this.props;
    const blob = new Blob([contact.toVCard()], {type:'text/vcard'});
    saveAs(blob, `${contact.name}.vcf`);
  }

  toggleRecommending = () => this.setState(prevState => ({recommending: !prevState.recommending}));
  delete = () => {
    const { contact, removeContact, history } = this.props;
    removeContact(contact.id);
    history.push('/');
  }

  sendRecommendation = (recommendedContactId) => {
    const { contact, recommend } = this.props;
    recommend(contact.id, recommendedContactId);
  }

  render() {
    const { contact, contacts, connections, isOnline } = this.props;
    const { recommender, recommending } = this.state;

    return (
      <div>
        {recommender && <div>Recommended by {recommender.name}</div>}
        <span>{isOnline ? 'online' : 'offline'}</span>
        { contact.stars && <span>{[...Array(contact.stars)].map((_,i) =>
          <span role="img" aria-label="star" key={i}>⭐</span>)}
        </span>}
        <img src={contact.img+'&size=300'} alt={contact.name} />
        <Header>{contact.name}</Header>
        <p>{contact.organization}</p>
        <LinkList>
          <LinkListItem as="a" href={`mailto:${contact.email}`}>{contact.email}</LinkListItem>
          <LinkListItem as="a" href={`tel:${contact.phone}`}>{contact.phone}</LinkListItem>
          <LinkListItem as="div">{contact.location}</LinkListItem>
          <LinkListItem as="div">{contact.affinities.toString()}</LinkListItem>
        </LinkList>
        <Button as="button" block onClick={this.download}>Download</Button>
        <Button as="button" block onClick={this.toggleRecommending} disabled={!isOnline}>Send Recommendation</Button>
        <Button as="button" block danger onClick={this.delete}>Delete</Button>
        {recommending && (
          <ContactList>
            {contacts.map(x=><ContactListItem key={x.id} {...x} onSelect={this.sendRecommendation} checked={contact.hasConnection(x.id, connections)} />)}
          </ContactList>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, { match: { params } }) => ({
  contacts: state.contacts.contacts,
  connections: state.connections.connections,
  contact: state.contacts.contacts.find(x=>x.id === params.id),
  isOnline: state.network.peers.find(x => x.peerName === params.id) != null
})

const mapDispatchToProps = {
  recommend,
  addStar,
  removeContact
}

export default connect(mapStateToProps, mapDispatchToProps)(Contact)
