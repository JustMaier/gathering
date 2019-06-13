import React from 'react'
import { Box, Text } from './UI'

const Recommender = ({ contact }) => {
  if (!contact || !contact.recommender) return null
  const recommender = contact.recommender

  return (
    <Box flexDirection='column' alignItems='center'>
      <Text allCaps fontSize='0'>Recommended By</Text>
      <Text fontSize='1'>{recommender.name}</Text>
    </Box>
  )
}

export default Recommender
