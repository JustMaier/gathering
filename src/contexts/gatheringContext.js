import React, { createContext, useContext, useEffect, useState } from 'react'
import db from '../db'
import { Gathering } from '../models'
import { useNetworkContext } from './networkContext'
import { uuid } from '../shared/utility'

export const GatheringContext = createContext()

export const GatheringContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [gathering, setGathering] = useState(null)
  const network = useNetworkContext()

  useEffect(() => {
    if (!network) return

    db.getActiveGathering().then(async gathering => {
      setGathering(gathering)
      if (gathering) network.start(gathering)
      setLoading(false)
    })
  }, [network])

  const processAffinities = async contact => {
    contact.affinities.filter(x => !x.id).forEach(x => { x.id = uuid() })
    await network.addAffinities(contact.affinities)
    return contact
  }

  const actions = {
    deactivate: async () => {
      await gathering.deactivate()
      await network.stop()
      setGathering(null)
    },
    activate: async (id) => {
      const gathering = await db.getGathering(id)
      await network.start(gathering)
      await gathering.activate()
      setGathering(gathering)
      return gathering
    },
    updateContact: async (data) => {
      Object.assign(gathering.contact, await processAffinities(data))
      await gathering.save()
      await network.updatePublicInfo(gathering.contact)
    },
    createGathering: async (gathering) => {
      gathering.contact = {}
      gathering = new Gathering(gathering)
      await network.start(gathering)
      await network.createGathering(gathering)
      await network.stop()
      return gathering
    },
    joinGathering: async (gathering, contact) => {
      gathering.contact = contact
      const gatheringId = await db.gatherings.add(new Gathering(gathering))
      gathering = await actions.activate(gatheringId)

      Object.assign(gathering.contact, await processAffinities(contact))
      await gathering.save()
      await network.updatePublicInfo(gathering.contact)
    },
    connectWith: async (codename) => network.swapContactInfo(codename),
    recommend: async (toId, { id }) => network.recommendContact(toId, id)
  }

  return (
    <GatheringContext.Provider value={{ gathering, loading, actions }}>
      {children}
    </GatheringContext.Provider>
  )
}

export const useGatheringContext = () => useContext(GatheringContext)
