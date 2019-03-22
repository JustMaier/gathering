import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateContact } from '../store/actions/contacts'
import ContactForm from '../components/ContactForm';

export class EditContact extends Component {

  finished = (data) => {
    this.props.updateContact(data);
    this.props.history.push('/');
  }

  render() {
    const { contact } = this.props;
    return (
      <React.Fragment>
        <ContactForm data={contact} onFinished={this.finished}></ContactForm>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  contact: state.contacts.contacts.find(x=>x.id === state.gatherings.activeGathering.contactId)
})

const mapDispatchToProps = {
  updateContact
}

export default connect(mapStateToProps, mapDispatchToProps)(EditContact)
