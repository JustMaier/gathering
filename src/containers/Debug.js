import React, { useState, useEffect } from 'react'
import { Header, ListGroup, ListGroupItem, Button } from '../components/UI'
import db from '../db'
import { MdComputer, MdCheck } from 'react-icons/md'

const sumArray = arr => arr.reduce((total, cur) => total + cur, 0)

const Debug = () => {
  const [peers, setPeers] = useState([])
  const [includeRank, setIncludeRank] = useState(true)
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
      const peerIds = db.node.libp2p.peerBook.getAllArray().filter(x => x.isConnected()).map(x => x.id.toB58String())
      setPeers(peerIds)
    }
    const updateIncludeRank = () => setIncludeRank(db.gathering.me.includeRank !== false)
    db.gathering.events.on('write', updateIncludeRank)
    db.gathering.events.on('write', updateIndicators)
    db.gathering.events.on('replicated', updateIndicators)
    db.node.libp2p.on('peer:connect', updatePeers)
    updateIndicators()
    updatePeers()
    updateIncludeRank()

    return () => {
      db.gathering.events.off('write', updateIncludeRank)
      db.gathering.events.off('write', updateIndicators)
      db.gathering.events.off('replicated', updateIndicators)
      db.node.off('peer:connect', updatePeers)
    }
  }, [])

  return (
    <>
      <Header>Debug</Header>
      <pre>{JSON.stringify(indicators, null, 4)}</pre>

      <Header fontSize='2' mt='5' mb='2'>Options</Header>
      <Button block sm bg={includeRank ? 'primary' : 'muted'} onClick={() => db.toggleAwardInclusion()}>Include me in leaderboard {includeRank && <MdCheck />}</Button>

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
