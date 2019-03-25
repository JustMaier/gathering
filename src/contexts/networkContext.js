import React, { createContext, useContext, useState, useEffect } from "react";
import network from "../network";
import { MeshClientEvents } from "simple-mesh-net";

export const NetworkContext = createContext();

export const NetworkContextProvider = ({ children }) => {
  const [peers, setPeers] = useState({});

  useEffect(() => {
    network.on(MeshClientEvents.PEER_CONNECT, (peer) => setPeers(x=>({...x, [peer.peerName]: x})));
    network.on(MeshClientEvents.PEER_CLOSE, (peer) => setPeers(x=>({...x, [peer.peerName]: undefined})));
    network.on('disconnect', () => setPeers({}));
  }, [])

  const actions = {
    connectWith: async (codename) => {
      return await network.swapContactInfo(codename);
    },
    recommend: async (toId, contact) => {
      return await network.recommendContact(toId, contact);
    }
  };

  return (
    <NetworkContext.Provider value={{ peers, actions }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
