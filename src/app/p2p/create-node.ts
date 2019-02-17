'use strict';
import PeerId from 'peer-id';
import PeerInfo from 'peer-info';
import Node from './libp2p-bundle';

function createPeerInfo(peerId, callback) {
	PeerInfo.create(peerId, (err, peerInfo) => {
		if (err) {
			return callback(err);
		}

		localStorage['p2p-id'] = JSON.stringify(peerInfo.id);
		// const peerIdStr = peerInfo.id.toB58String();
		// const ma = `/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star/p2p/${peerIdStr}`;

		// peerInfo.multiaddrs.add(ma);

		const node = new Node({
			peerInfo
		});

		callback(null, node);
	});
}

export const createNode = (callback) => {
	const peerId = localStorage['p2p-id']
		? JSON.parse(localStorage['p2p-id'])
		: null;

	if (peerId) {
		createPeerInfo(peerId, callback);
	}else{
		PeerId.create({ bits: 1024 }, (err, id) => {
			if (err) { throw err }
			localStorage['p2p-id'] = id.toJSON();
			createPeerInfo(id, callback);
		})
	}
}
