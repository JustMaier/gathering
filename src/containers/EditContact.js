import React, { useState, useEffect } from 'react'

import { Spinner, Form, Fieldset, FloatLabelInput, Button, Header, ImageInput } from '../components/UI'
import Affinities from './Affinities'
import db from '../db'

const defaultFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'codename', label: 'Code Name', required: true },
  { name: 'organization', label: 'Organization' },
  { name: 'email', label: 'Email' },
  { name: 'github', label: 'Github' },
  { name: 'twitter', label: 'Twitter' },
  { name: 'phone', label: 'Phone' },
  { name: 'location', label: 'Location' }
]

const initialContact = {}
defaultFields.forEach(x => { initialContact[x.name] = '' })

const EditContact = ({ history }) => {
  const [fields] = useState(defaultFields)
  const [contact, setContact] = useState(initialContact)
  const [affinities, setAffinities] = useState([])
  const [avatarImage, setAvatarImage] = useState(null)
  const [updatedAvatar, setUpdatedAvatar] = useState(false)

  useEffect(() => {
    const contact = db.getMe()
    setContact(x => ({ ...x, ...contact }))
    setAffinities(db.getMyAffinities())
    if (contact.avatar) db.getImageFromCid(contact.avatar).then(setAvatarImage)
  }, [])

  const setInput = e => setContact({ ...contact, [e.target.name]: e.target.value })
  const toggleAffinity = ({ name: affinityName }) => setAffinities(x => {
    const foundAt = affinities.indexOf(affinityName)
    return foundAt !== -1 ? affinities.filter((_, i) => foundAt !== i) : affinities.concat(affinityName)
  })
  const updateAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarImage(file)
    setUpdatedAvatar(true)
  }
  const submit = async e => {
    e.preventDefault()
    if (updatedAvatar) {
      contact.avatar = await db.addImage(avatarImage, { width: 200, height: 200 })
    }
    await db.updateMe(contact, affinities)
    history.push('/')
  }

  if (!contact) return <Spinner />
  return (
    <Form onSubmit={submit}>
      <Header mb='2'>Your Contact Info</Header>
      <ImageInput onChange={updateAvatar} value={avatarImage} mb='3' ml='auto' mr='auto' />
      <Fieldset>
        {fields.map(props => <FloatLabelInput value={contact[props.name]} onChange={setInput} key={props.name} {...props} />)}
      </Fieldset>

      <Header fontSize='3' mb='1'>Affinities</Header>
      <Affinities canEdit value={affinities} onToggle={toggleAffinity} />
      <Button as='button' type='submit' block>Update</Button>
    </Form>
  )
}

export default EditContact
