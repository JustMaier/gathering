import React, { useState, useEffect } from 'react'

import { Spinner, Form, Fieldset, FloatLabelInput, Button, Header, ImageInput } from '../components/UI'
import Affinities from './Affinities'
import db from '../db'

const defaultFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'organization', label: 'Organization' },
  { name: 'email', label: 'Email' },
  { name: 'github', label: 'Github' },
  { name: 'twitter', label: 'Twitter' },
  { name: 'phone', label: 'Phone' },
  { name: 'location', label: 'Location' }
]

const EditContact = ({ history }) => {
  const [fields, setFields] = useState(defaultFields)
  const [contact, setContact] = useState(null)
  const [avatarImage, setAvatarImage] = useState(null)
  const [updatedAvatar, setUpdatedAvatar] = useState(false)

  useEffect(() => {
    db.getMe().then(contact => {
      fields.forEach(({ name }) => {
        contact[name] = contact[name] || ''
      })

      if (contact.avatar) db.getImageFromCid(contact.avatar).then(setAvatarImage)

      setContact(contact)
    })
  }, [])

  const setInput = e => setContact({ ...contact, [e.target.name]: e.target.value })
  const toggleAffinity = ({ name: affinityName }) => setContact(x => {
    const foundAt = x.affinities.indexOf(affinityName)
    const affinities = foundAt !== -1 ? x.affinities.filter((_, i) => foundAt !== i) : x.affinities.concat(affinityName)
    return { ...x, affinities }
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
    await db.updateMe(contact)
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
      <Affinities canEdit value={contact.affinities} onToggle={toggleAffinity} />
      <Button as='button' type='submit' block>Update</Button>
    </Form>
  )
}

export default EditContact
