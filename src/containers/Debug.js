import React, { useState, useEffect } from 'react'
import { Header, ListGroup, ListGroupItem } from '../components/UI'
import db from '../db'
import { MdComputer } from 'react-icons/md'

const sumArray = arr => arr.reduce((total, cur) => total + cur, 0)

const Debug = () => {
  const [peers, setPeers] = useState([])
  const [indicators, setIndicators] = useState({
    members: 0,
    connections: 0,
    recommendations: 0,
    stars: 0,
    logSize: 0,
    eventListeners: 0
  })

  useEffect(() => {
    const updateIndicators = () => {
      console.log('update indicitors')
      setIndicators({
        members: Object.keys(db.gathering.members).length,
        connections: sumArray(Object.values(db.gathering._tables.connections).map(x => Object.keys(x).length)),
        recommendations: sumArray(Object.values(db.gathering._tables.recommendations).map(x => Object.keys(x).length)),
        stars: sumArray(Object.values(db.gathering._tables.stars).map(x => sumArray(Object.values(x)))),
        logSize: db.gathering.size,
        eventListeners: db.gathering.events.listenerCount('write') + db.gathering.events.listenerCount('replicated')
      })
    }
    const updatePeers = () => {
      console.log('update peers')
      const peerIds = db.node.libp2p.peerBook.getAllArray().filter(x => x.isConnected()).map(x => x.id.toB58String())
      setPeers(peerIds)
    }
    db.gathering.events.on('replicated', updateIndicators)
    db.node.libp2p.on('peer:connect', updatePeers)
    updateIndicators()
    updatePeers()

    return () => {
      db.gathering.events.off('replicated', updateIndicators)
      db.node.off('peer:connect', updatePeers)
    }
  }, [])
  return (
    <>
      <Header>Debug</Header>
      <pre>{JSON.stringify(indicators, null, 4)}</pre>

      <Header fontSize='2' mt='5' mb='2'>Peers</Header>
      <ListGroup mb='5'>
        { peers.map(x => (
          <ListGroupItem key={x} selectable={false}><MdComputer /> {x}</ListGroupItem>
        ))}
      </ListGroup>
    </>
  )
}

export default Debug
