// Type definitions for libp2p 0.22.0
// Project: https://github.com/libp2p/js-libp2p
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="libp2p-bootstrap"/>
/// <reference types="interface-connection"/>
/// <reference types="interface-transport"/>
/// <reference types="libp2p-kad-dht"/>
/// <reference types="libp2p-mdns"/>
/// <reference types="libp2p-mplex"/>
/// <reference types="libp2p-secio"/>
/// <reference types="libp2p-spdy"/>
/// <reference types="peer-book"/>
/// <reference types="peer-info"/>

declare namespace LibP2p {
    export type OptionsConfig = {
        dht?: {
            kBucketSize?: number
        },
        EXPERIMENTAL?: {
            pubsub?: boolean,
            dht?: boolean
        },
        peerDiscovery?: {
            mdns?: {
                interval?: number
                enabled?: boolean
            },
            webrtcStar?: {
                interval?: number
                enabled?: boolean
            }
        },
        peerRouting?: {},
        contentRouting?: {},
        relay?: {
            enabled?: boolean,
            hop?: {
                enabled?: boolean,
                active?: boolean
            }
        }
    };

    export type OptionsModules = {
        connEncryption: Array<LibP2pSecio>,
        streamMuxer: Array<LibP2pMplex | LibP2pSpdy>,
        dht?: typeof LibP2pKadDht,
        peerDiscovery: Array<LibP2pBootstrap | LibP2pMdns>,
        transport: LibP2pTransport[]
	};


    export type Options = {
        config: OptionsConfig,
        modules: OptionsModules,
        peerBook?: PeerBook,
        peerInfo: PeerInfo,
    };

    export type Events = 'peer:connect' | 'peer:disconnect' | 'peer:discovery' | 'start' | 'stop';
}

declare class LibP2pTransport{}

declare class LibP2p {
    readonly _dht: LibP2pKadDht;

    constructor(options: LibP2p.Options);

    readonly peerInfo: PeerInfo;

    dial(peerInfo: PeerInfo, cb: (error: Error | null) => any): void;
    dialProtocol(peerInfo: PeerInfo | Multiaddr.Multiaddr, protocol: string, cb: (error: Error | null, conn?: LibP2pConnection) => any): void;
    handle(protocol: string, handler: (protocol: string, conn: LibP2pConnection) => any, matcher?: (protocol: string, requestedProtocol: string, cb: (error: Error | null, accept: boolean) => void) => any): void;
    isStarted(): boolean;
    on(event: LibP2p.Events, cb: (event: any) => any): void;
    ping(peerInfo: PeerInfo, callback: (error: Error | null, ping: any) => void): void;
    start(cb: (error: Error | null) => any): void;
	stop(cb: (error: Error | null) => any): void;
	hangup(peerInfo: PeerInfo): void;
	unhandle(protocol: string): void;
	pubsub: any;
}

declare class LibP2pConnection {
	getPeerInfo(cb: (peerInfo: PeerInfo) => void): void;
}

declare module 'libp2p' {
    export default LibP2p;
}
