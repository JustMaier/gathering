import React, { createContext, useContext, useEffect, useState } from 'react'
import MeshNet from '../network'

export const NetworkContext = createContext()

export const NetworkContextProvider = ({ children }) => {
  const [network, setNetwork] = useState(null)

  useEffect(() => {
    MeshNet.create().then(node => {
      setNetwork(() => node)
    })
  }, [])

  return (
    <NetworkContext.Provider value={network}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetworkContext = () => useContext(NetworkContext)
