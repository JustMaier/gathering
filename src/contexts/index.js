import React from 'react'
import {
  GatheringContextProvider,
  useGatheringContext
} from './gatheringContext'
import { NetworkContextProvider, useNetworkContext } from './networkContext'

export const AppContextProvider = ({ children }) => {
  return (
    <GatheringContextProvider>
      <NetworkContextProvider>{children}</NetworkContextProvider>
    </GatheringContextProvider>
  )
}

export {
  useNetworkContext,
  useGatheringContext
}
