import React, { useEffect, useState } from 'react'
import { Header, Box, Text } from '../components/UI'
import { ContactList, ContactListItem } from '../components/ContactList'
import db from '../db'

const Recommendations = ({ ...props }) => {
  const [recommendations, setRecommendations] = useState(db.getRecommendations())
  useEffect(() => {
    const updateRecommendations = () => setRecommendations(db.getRecommendations())
    db.gathering.events.on('write', updateRecommendations)
    db.gathering.events.on('replicated', updateRecommendations)

    return () => {
      db.gathering.events.off('write', updateRecommendations)
      db.gathering.events.off('replicated', updateRecommendations)
    }
  }, [])

  if (recommendations.length === 0) return null

  return (
    <Box flexDirection='column' {...props}>
      <Header fontSize='3' mb='1'>Recommendations</Header>

      <ContactList>
        { recommendations.map(x =>
          <ContactListItem
            key={x.id}
            {...x}
            onDecline={() => db.deleteRecommendation(x.id)}
          >
            <Text color='muted' fontSize='0' mt='1'>{x.by.join(', ')}</Text>
          </ContactListItem>
        )}
      </ContactList>
    </Box>
  )
}

export default Recommendations
