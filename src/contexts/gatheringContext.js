import React, { createContext, useContext, useEffect, useState } from "react";
import db from "../db";
import network from '../network';
import { Gathering } from "../models";

export const GatheringContext = createContext();

export const GatheringContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [gathering, setGathering] = useState(null);
  useEffect(() => {
    db.getActiveGathering().then(async gathering => {
      setGathering(gathering);
      if(gathering) await network.connect(gathering);
      setLoading(false);
    });
  }, [])

  const actions = {
    deactivate: async () => {
      await gathering.deactivate();
      await network.disconnect();
      setGathering(null);
    },
    activate: async (id) => {
      const gathering = await db.getGathering(id);
      await network.connect(gathering);
      await gathering.activate();
      setGathering(gathering);
    },
    updateContact: async (data) => {
      Object.assign(gathering.contact, data);
      await gathering.save();
    },
    addGathering: async (gathering, contact) => {
      gathering.contact = contact;
      return await db.gatherings.add(new Gathering(gathering));
    }
  };

  return (
    <GatheringContext.Provider value={{ gathering, loading, actions }}>
      {children}
    </GatheringContext.Provider>
  );
};

export const useGatheringContext = () => useContext(GatheringContext);
