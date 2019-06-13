import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from '../components/UI'
import db from '../db'
import { useGatheringContext } from '../contexts'
import { MdAddCircle, MdChevronRight } from 'react-icons/md'

const Gatherings = () => {
  const { actions } = useGatheringContext()
  const [gatherings, setGatherings] = useState([])
  useEffect(() => {
    db.getGatherings().then(setGatherings)
  }, [])

  return (
    <React.Fragment>
      <ListGroup mt='5' mb='5'>
        {gatherings.map(x => <ListGroupItem key={x.id} onClick={() => actions.activate(x.id)}><MdChevronRight /> {x.name}</ListGroupItem>)}
        <ListGroupItem as={Link} to='/gatherings/create'><MdAddCircle /> Create Gathering</ListGroupItem>
      </ListGroup>
    </React.Fragment>
  )
}

export default Gatherings
