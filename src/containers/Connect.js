import React, { useState } from 'react'
import {Link} from 'react-router-dom';
import { Button, Spinner, Header, Form, Fieldset, FloatLabelInput } from '../components/UI';
import { useGatheringContext, useNetworkContext } from '../contexts';

const Connect = () => {
  const [codename, setCodename] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const { gathering } = useGatheringContext();
  const { actions: networkActions } = useNetworkContext();

  const startConnection = async e => {
    e.preventDefault();
    setStatus('loading');
    try{
      const contact = await networkActions.connectWith(codename);
      await gathering.addContact(contact);
      setStatus('connected');
    } catch(err) {
      setStatus('pending');
      setError(err.message);
    }
  }

  // Render
  if(status === 'loading')
      return <Spinner />;

  if(status === 'connected')
      return (
        <div>
          <p>You've connected successfully</p>
          <Button as={Link} to="/">Done</Button>
        </div>
      );

  return (
    <Form onSubmit={startConnection}>
      <Header>Connect</Header>
      <p>Your codename is {gathering.contact.codename}</p>
      {error && <div>{error}</div>}
      <Fieldset>
        <FloatLabelInput name="codename" value={codename} label="Their Code Name" onChange={(e) => setCodename(e.target.value)} required />
      </Fieldset>
      <Button as="button" type="submit" block>Connect</Button>
    </Form>
  )
}

export default Connect;
