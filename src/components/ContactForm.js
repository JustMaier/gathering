import React, { useState, useEffect } from 'react'
import { Form, Fieldset, FloatLabelInput, Button, Header, Tag, TagList, Box, ColorInput } from './UI'
import { MdAddCircle } from 'react-icons/md'

const ContactForm = ({ onFinished, data = null }) => {
  const [contact, setContact] = useState(data || { name: '', codename: '', affinities: [] })
  const [affinities, setAffinities] = useState([])
  const [addingAffinity, setAddingAffinity] = useState(false)
  const [affinity, setAffinity] = useState({ color: '#666666' })
  const setInput = e => setContact({ ...contact, [e.target.name]: e.target.value })
  const toggleAffinity = (affinity) => setContact(x => {
    const foundAt = x.affinities.findIndex(a => a.name === affinity.name)
    return { ...x, affinities: foundAt !== -1 ? x.affinities.filter((_, i) => foundAt !== i) : x.affinities.concat(affinity) }
  })
  const createAffinity = async () => {
    setAddingAffinity(false)
    setAffinities(x => ([...x, affinity]))
    toggleAffinity(affinity)
    setAffinity({ color: '#666666' })
  }
  const submit = e => {
    e.preventDefault()
    onFinished(contact)
  }

  const fields = [
    { name: 'codename', label: 'Code Name', required: true, if: contact.gatheringId == null || contact.codename == null },
    { name: 'name', label: 'Name', required: true },
    { name: 'organization', label: 'Organization' },
    { name: 'email', label: 'Email', required: !contact.github && !contact.twitter },
    { name: 'github', label: 'Github', required: !contact.email && !contact.twitter },
    { name: 'twitter', label: 'Twitter', required: !contact.github && !contact.email },
    { name: 'phone', label: 'Phone' },
    { name: 'location', label: 'Location' }
  ].filter(x => x.if == null || x.if)

  return (
    <Form onSubmit={submit}>
      <Header mb='2'>Your Contact Info</Header>
      <Fieldset>
        {fields.map(props => <FloatLabelInput value={contact[props.name]} onChange={setInput} key={props.name} {...props} />)}
      </Fieldset>

      <Header fontSize='3' mb='1'>Affinities</Header>
      <TagList mb={addingAffinity ? 2 : 4}>
        {affinities.map(a => <Tag key={a.id} band={a.color} onClick={() => toggleAffinity(a)} active={contact.affinities.findIndex(x => x.name === a.name) !== -1}>{a.name}</Tag>)}
        <Tag onClick={() => setAddingAffinity(x => !x)}>Add <MdAddCircle /></Tag>
      </TagList>
      {!addingAffinity ? null : (
        <Box mb='4'>
          <ColorInput style={{ width: '46px' }} borderRadius='left' type='color' onChange={e => setAffinity({ ...affinity, color: e.target.value })} value={affinity.color} />
          <FloatLabelInput label='Affinity name' type='text' onChange={e => setAffinity({ ...affinity, name: e.target.value })} value={affinity.name} />
          <Button as='button' type='button' sm onClick={createAffinity} borderRadius='right'><MdAddCircle /></Button>
        </Box>
      )}
      <Button as='button' type='submit' block>{contact.gatheringId ? 'Update' : 'Join Gathering'}</Button>
    </Form>
  )
}

export default ContactForm
