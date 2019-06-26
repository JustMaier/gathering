import React, { useState } from 'react'
import { Spinner, Form, Fieldset, FloatLabelInput, Button, Header } from '../components/UI'
import { addDays } from '../shared/utility'
import db from '../db'

const fields = [
  { name: 'name', label: 'Gathering Name', required: true },
  { name: 'place', label: 'Location', required: true },
  { name: 'end', label: 'End Time', type: 'datetime-local', required: true }
]

const CreateGathering = ({ location }) => {
  const defaultEndDate = addDays(new Date(), 1)
  const [gathering, setGathering] = useState({ name: '', place: '', end: `${defaultEndDate.toISOString().split('T')[0]}T09:00:00` })
  const [loading, setLoading] = useState(false)

  const setInput = e => setGathering({ ...gathering, [e.target.name]: e.target.value })
  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    const key = await db.createGathering(gathering)
    await db.activateGathering(key)
  }

  if (loading) return <Spinner />
  return (
    <React.Fragment>
      <Form onSubmit={submit}>
        <Header mb='2'>Gathering details</Header>
        <Fieldset>
          {fields.map(props => <FloatLabelInput value={gathering[props.name]} onChange={setInput} key={props.name} {...props} />)}
        </Fieldset>
        <Button as='button' type='submit' block>Start Gathering</Button>
      </Form>
    </React.Fragment>
  )
}

export default CreateGathering
