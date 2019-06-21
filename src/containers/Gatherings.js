import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, Spinner } from '../components/UI'
import db from '../db'
import { MdAddCircle, MdChevronRight } from 'react-icons/md'

const Gatherings = () => {
  const [gatherings, setGatherings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setGatherings(db.getGatherings())
  }, [])

  if (loading) return <Spinner />

  const activateGathering = async (key) => {
    setLoading(true)
    await db.activateGathering(key)
  }

  return (
    <React.Fragment>
      <ListGroup mt='5' mb='5'>
        {gatherings.map(x => <ListGroupItem key={x.key} onClick={() => activateGathering(x.key)}><MdChevronRight /> {x.name}</ListGroupItem>)}
        <ListGroupItem as={Link} to='/gatherings/create'><MdAddCircle /> Create Gathering</ListGroupItem>
      </ListGroup>
    </React.Fragment>
  )
}

export default Gatherings
