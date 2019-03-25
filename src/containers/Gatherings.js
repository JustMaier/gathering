import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem } from '../components/UI';
import db from '../db'
import { useGatheringContext } from '../contexts'


const Gatherings = () => {
  const { actions } = useGatheringContext();
  const [gatherings, setGatherings] = useState([]);
  useEffect(() => {
    db.getGatherings().then(setGatherings)
  }, []);

  return (
    <React.Fragment>
      <ListGroup>
        {gatherings.map(x=><ListGroupItem as="button" key={x.id} onClick={()=>actions.activate(x.id)}>{x.name}</ListGroupItem>)}
        <ListGroupItem as={Link} to="/gatherings/create">Create Gathering</ListGroupItem>
      </ListGroup>
    </React.Fragment>
  )
}

export default Gatherings;
