import React, { createContext, useContext, useState, useEffect } from 'react'
import network from '../network'
import { MeshClientEvents } from 'simple-mesh-net'

export const NetworkContext = createContext()

export const NetworkContextProvider = ({ children }) => {
  const [peers, setPeers] = useState({})
  const [recommendation, setRecommendation] = useState(null)

  useEffect(() => {
    network.on(MeshClientEvents.PEER_CONNECT, (peer) => setPeers(x => ({ ...x, [peer.peerName]: x })))
    network.on(MeshClientEvents.PEER_CLOSE, (peer) => setPeers(x => ({ ...x, [peer.peerName]: undefined })))
    network.on('disconnect', () => setPeers({}))
    let recommendTimeout
    network.on('recommendation-received', (contact) => {
      setRecommendation(x => contact)
      if (recommendTimeout) clearTimeout(recommendTimeout)
      recommendTimeout = setTimeout(() => setRecommendation(x => null), 5000)
    })
  }, [])

  const actions = {
    connectWith: async (codename) => {
      return network.swapContactInfo(codename)
    },
    recommend: async (toId, contact) => {
      return network.recommendContact(toId, contact)
    }
  }

  return (
    <NetworkContext.Provider value={{ peers, recommendation, actions }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetworkContext = () => useContext(NetworkContext)
