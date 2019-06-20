import React from 'react'
import {
  GatheringContextProvider,
  useGatheringContext
} from './gatheringContext'
import { NetworkContextProvider, useNetworkContext } from './networkContext'

export const AppContextProvider = ({ children }) => {
  return (
    <NetworkContextProvider>
      <GatheringContextProvider>
        {children}
      </GatheringContextProvider>
    </NetworkContextProvider>
  )
}

export {
  useGatheringContext,
  useNetworkContext
}
