import React, { useEffect, useState } from 'react'
import { Header, Box } from '../components/UI'
import { ContactList, ContactListItem } from '../components/ContactList'
import { MdSend } from 'react-icons/md'
import db from '../db'

const Recommendations = ({ ...props }) => {
  const [recommendations, setRecommendations] = useState([])
  useEffect(() => {
    const updateRecommendations = () => setRecommendations(db.getRecommendations())
    db.my.recommendations.events.on('write', updateRecommendations)
    db.my.recommendations.events.on('replicated', updateRecommendations)
    updateRecommendations()

    return () => {
      db.my.recommendations.events.off('write', updateRecommendations)
      db.my.recommendations.events.off('replicated', updateRecommendations)
    }
  }, [])

  if (recommendations.length === 0) return null

  return (
    <Box flexDirection='column' {...props}>
      <Header fontSize='3' mb='1'>Recommendations</Header>

      <ContactList>
        {recommendations.map(x => <ContactListItem key={x.id} {...x} onApprove={() => db.sendRequest(x.id)} approveIcon={MdSend} onDecline={() => db.deleteRecommendation(x.id)} />)}
      </ContactList>
    </Box>
  )
}

export default Recommendations
