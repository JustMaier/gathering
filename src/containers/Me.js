import React, { useEffect, useState } from 'react'
import { Box, CIDPhoto, Header, LinkButton, Text } from '../components/UI'
import { MdEdit } from 'react-icons/md'
import db from '../db'

const Me = () => {
  const [me, setMe] = useState(null)
  useEffect(() => {
    const updateMe = () => db.getMe().then(setMe)
    db.gatherings.events.on('write', updateMe)
    updateMe()

    return () => {
      db.gatherings.events.off('write', updateMe)
    }
  }, [])

  if (!me) return null
  return (
    <Box alignItems='center' justifyContent='center'>
      <CIDPhoto src={me.avatar} size='60px' />
      <Box ml='2' flexDirection='column'>
        <Header fontSize='4'>{me.name}</Header>
        <Text fontSize='1' color='muted'>{me.organization}</Text>
      </Box>
      <LinkButton to='/edit' ml='auto'><MdEdit /></LinkButton>
    </Box>
  )
}

export default Me
