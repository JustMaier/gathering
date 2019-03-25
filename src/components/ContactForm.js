import React, { useState, useEffect } from 'react'
import { Form, Fieldset, FloatLabelInput, Button, Header } from './UI';

const ContactForm = ({onFinished, data = null}) => {
  const [contact, setContact] = useState(data || {name:'', codename: ''});
  const setInput = e => setContact({...contact, [e.target.name]: e.target.value});
  const submit = e => {
    e.preventDefault();
    onFinished(contact);
  }

  useEffect(() => {

  }, [data]);
  const fields = [
    {name: 'codename', label: 'Code Name', required: true, if: contact.gatheringId == null || contact.codename == null},
    {name: 'name', label: 'Name', required: true},
    {name: 'organization', label: 'Organization'},
    {name: 'email', label: 'Email', required: true},
    {name: 'phone', label: 'Phone', required: true},
    {name: 'location', label: 'Location', required: true}
  ].filter(x=>x.if == null || x.if);

  return (
    <Form onSubmit={submit}>
      <Header>Gathering details</Header>
      <Fieldset>
        {fields.map(props=><FloatLabelInput value={contact[props.name]} onChange={setInput} key={props.name} {...props}/>)}
      </Fieldset>
      <Button as="button" type="submit" block>{contact.gatheringId ? 'Update' : 'Join Gathering'}</Button>
    </Form>
  )
}

export default ContactForm;
