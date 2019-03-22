import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from '../components/UI/Spinner';
import { deactivateGathering } from '../store/actions/gatherings';
import Button from '../components/UI/Button';
import Me from '../components/Me';
import Stats from '../components/Stats';
import { ContactList, ContactListItem } from '../components/ContactList';

export class Gathering extends Component {

  render() {
    const { gathering, deactivateGathering, contacts, connections, awards } = this.props;
    const me = contacts[0];
    if(gathering == null) return <Spinner/>

    return (
      <React.Fragment>
        <Me {...me} />
        <Stats connections={connections} awards={awards} />
        <ContactList contacts={contacts} connections={connections}/>
        <ContactList>
          {contacts.map(x=><ContactListItem key={x.id} {...x} />)}
        </ContactList>
        <Button as="button" sm onClick={() => deactivateGathering()}>Close gathering</Button>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  gathering: state.gatherings.activeGathering,
  contacts: state.contacts.contacts,
  connections: state.connections.connections,
  awards: state.connections.awards
});

const mapDispatchToProps = {
  deactivateGathering
}

export default connect(mapStateToProps, mapDispatchToProps)(Gathering)
