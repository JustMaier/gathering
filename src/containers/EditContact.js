import React from 'react';
import ContactForm from '../components/ContactForm';
import { useGatheringContext } from '../contexts';

export const EditContact = ({ history }) => {
  const { gathering, actions } = useGatheringContext();

  const finished = (data) => {
    actions.updateContact(data);
    history.push('/');
  }

  return (
    <React.Fragment>
      <ContactForm data={gathering.contact} onFinished={finished}></ContactForm>
    </React.Fragment>
  )
}

export default EditContact
