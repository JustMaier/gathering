import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import ContactForm from '../components/ContactForm'
import GatheringForm from '../components/GatheringForm'
import { useGatheringContext } from '../contexts'
import { Spinner } from '../components/UI'

const JoinGathering = ({ location }) => {
  const { actions } = useGatheringContext()
  const [ready, setReady] = useState(false)
  const [gathering, setGathering] = useState({})

  // Check the query string to see if we already have a gathering
  useEffect(() => {
    const qs = queryString.parse(location.search)
    if (qs.id) setGathering(qs)
    setReady(true)
  }, [])
  if (!ready) return <Spinner />

  const joinGathering = async (contact) => {
    const gatheringId = await actions.addGathering(gathering, contact)
    await actions.activate(gatheringId)
  }

  return (
    <React.Fragment>
      {!gathering.name ? (
        <GatheringForm onFinished={setGathering} />
      ) : (
        <ContactForm onFinished={joinGathering} />
      )}
    </React.Fragment>
  )
}

export default JoinGathering
