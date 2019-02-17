import WebRTCStar from 'libp2p-webrtc-star';
import WebSockets from 'libp2p-websockets';
import WebSocketStar from 'libp2p-websocket-star';
import Mplex from 'libp2p-mplex';
import SPDY from 'libp2p-spdy';
import SECIO from 'libp2p-secio';
import Bootstrap from 'libp2p-bootstrap';
import defaultsDeep from '@nodeutils/defaults-deep';
import libp2p from 'libp2p';

const bootstrapList = [
	'/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
	'/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
	'/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
	'/dns4/sfo-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
	'/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
	'/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
	'/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
	'/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
	'/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
	'/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
];

export default class Node extends libp2p {
	constructor(_options) {
		const wrtcStar = new WebRTCStar({id: _options.peerInfo.id});
		const wsstar = new WebSocketStar({id: _options.peerInfo.id});

		const defaults = {
			modules: {
				transport: [wrtcStar, WebSockets, wsstar],
				streamMuxer: [Mplex, SPDY],
				connEncryption: [SECIO],
				peerDiscovery: [wrtcStar.discovery, wsstar.discovery, Bootstrap]
			},
			config: {
				peerDiscovery: {
					webRTCStar: {
						enabled: true
					},
					websocketStar: {
						enabled: true
					},
					bootstrap: {
						interval: 10000,
						enabled: true,
						list: bootstrapList
					}
				},
				relay: {
					enabled: true,
					hop: {
						enabled: true,
						active: false
					}
				},
				EXPERIMENTAL: {
					dht: false,
					pubsub: true
				}
			},
			connectionManager: {
				maxPeers: 50
			}
		};

		super(defaultsDeep(_options, defaults));
	}
}
