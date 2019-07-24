import React, { useState, useEffect } from 'react'
import { Header } from '../components/UI'
import db from '../db'

const Log = () => {
  const [log, setLog] = useState([])

  useEffect(() => {
    const updateLog = () => {
      setLog(JSON.stringify(db.gathering._index._raw, null, 4))
    }
    db.gathering.events.on('write', updateLog)
    db.gathering.events.on('replicated', updateLog)
    updateLog()

    return () => {
      db.gathering.events.off('write', updateLog)
      db.gathering.events.off('replicated', updateLog)
    }
  }, [])

  return (
    <>
      <Header>Log</Header>
      <pre style={{ overflow: 'hidden' }}>{log}</pre>
    </>
  )
}

export default Log
