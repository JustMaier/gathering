import React, { useState } from 'react'
import { Button, Text, Spinner, Header, Form, Fieldset, FloatLabelInput, Box, QR, Alert } from '../components/UI'
import { useGatheringContext } from '../contexts'

const Connect = ({ history }) => {
  const [codename, setCodename] = useState('')
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState(null)
  const { gathering, actions } = useGatheringContext()

  const startConnection = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      const contact = await actions.connectWith(codename)
      await gathering.addContact(contact)
      setStatus('connected')
    } catch (err) {
      setStatus('pending')
      setError(err.message)
    }
  }

  // Render
  if (status === 'loading') { return <Spinner /> }

  if (status === 'connected') {
    return (
      <Box flexDirection='column' alignItems='center'>
        <Header>Connected</Header>
        <Text fontSize='1' color='muted' mb='4'>You've successfully connected with {codename}</Text>
        <Button onClick={() => history.goBack()}>Go Back</Button>
      </Box>
    )
  }

  return (
    <Form onSubmit={startConnection}>
      <Header>Connect</Header>
      <Text fontSize='1' color='muted' mb='4'>Your codename is {gathering.contact.codename}</Text>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Fieldset>
        <FloatLabelInput name='codename' value={codename} label='Their Code Name' onChange={(e) => setCodename(e.target.value)} required />
      </Fieldset>
      <Button as='button' type='submit' block>Connect</Button>
      <Text mt='5' color='muted' fontSize='1' textAlign='center'>Not in the gathering yet? Scan this QR code!</Text>
      <QR mt='2' mb='4' link={`http://${window.location.host}/gatherings/join?id=${gathering.id}&name=${gathering.name}&end=${gathering.end}`} />
    </Form>
  )
}

export default Connect
