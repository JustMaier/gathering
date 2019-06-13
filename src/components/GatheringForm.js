import React, { useState } from 'react'
import { Form, Fieldset, FloatLabelInput, Button, Header } from './UI'
import { addDays } from '../shared/utility'

const fields = [
  { name: 'name', label: 'Gathering Name', required: true },
  { name: 'end', label: 'Gathering End Time', type: 'datetime-local', required: true }
]

const GatheringForm = ({ onFinished }) => {
  const defaultEndDate = addDays(new Date(), 1)
  const [gathering, setGathering] = useState({ name: '', end: `${defaultEndDate.toISOString().split('T')[0]}T09:00:00` })
  const setInput = e => setGathering({ ...gathering, [e.target.name]: e.target.value })
  const submit = e => {
    e.preventDefault()
    onFinished(gathering)
  }

  return (
    <Form onSubmit={submit}>
      <Header mb='2'>Gathering details</Header>
      <Fieldset>
        {fields.map(props => <FloatLabelInput value={gathering[props.name]} onChange={setInput} key={props.name} {...props} />)}
      </Fieldset>
      <Button as='button' type='submit' block>Start Gathering</Button>
    </Form>
  )
}

export default GatheringForm
