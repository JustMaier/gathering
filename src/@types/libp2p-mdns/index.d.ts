// Type definitions for libp2p-mdns 0.12.0
// Project: https://github.com/libp2p/js-libp2p-mdns
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="peer-info"/>

declare namespace LibP2pMdns {
  type Options = {
    broadcast?: boolean,
    interval?: number,
    peerInfo: PeerInfo,
    port?: number,
    serviceTag?: string
  };

  type Events = 'peer';
}

declare class LibP2pMdns {
  constructor (options: LibP2pMdns.Options);

  on (event: LibP2pMdns.Events, cb: (peerInfo: PeerInfo) => any): void;
}

declare module 'libp2p-mdns' {
export default LibP2pMdns;
}
