import React, { useState } from 'react'
import { Button, Text, Spinner, Header, Form, Fieldset, FloatLabelInput, Box, QR, Alert } from '../components/UI'
import db from '../db'
import Requests from './Requests'
import Recommendations from './Recommendations'

const Connect = ({ history }) => {
  const [name, setName] = useState('')
  const [alert, setAlert] = useState({ message: null, variant: 'danger' })
  const [loading, setLoading] = useState(false)

  const connect = async e => {
    e.preventDefault()
    setLoading(true)
    const members = await db.queryMembers(x => x.id !== db.memberId && x.name.trim().toLowerCase() === name.trim().toLowerCase())
    if (members.length === 0) {
      setAlert({ message: 'We couldn\'t find anyone with that name. Please check the name and try again', variant: 'danger' })
    } else {
      for (let i in members) {
        const member = members[i]
        try {
          await db.sendRequest(member.id)
        } catch (err) {
          setAlert({ message: 'We had trouble sending your request, please refresh and try again.', variant: 'danger' })
        }
      }
      setName('')
      setAlert({ message: 'Your request to connect has been sent', variant: 'success' })
    }
    setLoading(false)
  }

  if (loading) return <Spinner />

  return (
    <>
      {alert.message ? <Alert variant={alert.variant}>{alert.message}</Alert> : null}
      <Recommendations mb='4' />
      <Requests mb='4' />
      <Form onSubmit={connect}>
        <Header>Connect</Header>
        <Fieldset>
          <FloatLabelInput name='name' value={name} label='Their Name' onChange={(e) => setName(e.target.value)} required />
        </Fieldset>
        <Button as='button' type='submit' block>Connect</Button>
      </Form>
      <Box flexDirection='column'>
        <Text mt='5' color='muted' fontSize='1' textAlign='center'>Not in the gathering yet? Scan this QR code!</Text>
        <QR mt='2' mb='4' link={db.shareableAddress} />
      </Box>
    </>
  )
}

export default Connect
