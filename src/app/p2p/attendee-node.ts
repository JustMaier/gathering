import pull from 'pull-stream';
import hash from 'object-hash';
import Storage from './storage';
import Node from './libp2p-bundle'
import Contact from '../models/Contact';
import Recommendation from '../models/Recommendation';
import Connection from '../models/Connection';
import NodeInfo from '../models/NodeInfo';

const PII = ['email', 'phone', 'location', 'peerInfo'];
const scoreKeeperDelimiter = '|-+-|';
const intervals = {
	ranking: 60,
	sync: 15
};
const BufferJson = (obj: object) => Buffer.from(JSON.stringify(obj));

export default class AttendeeNode {
	private codename: string;
	private gathering: string;
	private hash: string;

	constructor(private node: Node, private storage: Storage) {
		this.node = node;
		this.storage = storage;
	}

	joinGathering(gatheringName: string) {
		// I'm still a little unclear about how the activateGathering action might work for the second person to join.
    // Would he or she have the same option to re-set the gathering name, or is this something you would 
    // limit from the front end interface?  Or does setting a new name create a new gathering?
    this.storage.activateGathering(gatheringName);
		this.codename = this.storage.getCodename();
		this.hash = hash({
			gathering: this.gathering,
			codename: this.codename
		});
		this.gathering = gatheringName;
    // Should we create the affinities options for the gathering here? 
		this.node.pubsub.subscribe(gatheringName, () => {
			// TODO listen for score stuff
		});
		this.node.handle(this.gathering + '-recommendation', (protocol, conn) =>
			this.receiveRecommendation(conn)
		);
	}

	setContactInfo(info: NodeInfo) {
		this.storage.setInfo(info);
		this.storage.save();
	}

	private rankingSyncInterval: any;
	private scoreSyncInterval: any;
	private syncInProgress: boolean;
	announceForScoreKeeper(data: object) {
		this.node.pubsub.publish(
			this.gathering + '-score',
			BufferJson(data)
		);
	}
	joinScoreKeepers() {
		this.node.pubsub.subscribe(this.gathering + '-score', ({data}) => {
			const connection = JSON.parse(data.toString('utf8'));
			const connectionHash = hash({
				gathering: this.gathering,
				from: connection.from,
				to: connection.to
			});
			if (connection.recommender == null) connection.active = true;
			this.storage.upsertConnection(connectionHash, connection);
			this.storage.save();
		});
		this.node.pubsub.subscribe(
			this.gathering + '-scoresync',
			({data}) => {
				const {time, peerInfo} = JSON.parse(data);
				if (time < this.storage.getConnectionsTime())
					this.sendConnections(peerInfo);
			}
		);

		this.rankingSyncInterval = setInterval(
			this.postRankings,
			intervals.ranking * 1000
		);

		this.scoreSyncInterval = setInterval(
			this.postLastConnection,
			intervals.sync * 1000
		);
		this.postLastConnection();

		this.syncInProgress = false;
		this.node.handle('sync-score', this.receiveConnections);
	}
	leaveScoreKeepers() {
		this.scoreSyncInterval.clear();
		this.rankingSyncInterval.clear();
		this.node.pubsub.unsubscribe(this.gathering + '--score');
		this.node.pubsub.unsubscribe(this.gathering + '-scoresync');
	}
	sendConnections(peerInfo: PeerInfo) {
		this.node.dialProtocol(peerInfo, 'sync-score', (err, conn) => {
			pull(
				pull.once(
					Buffer.from(
						this.storage.getConnectionsTime() +
							scoreKeeperDelimiter +
							JSON.stringify(this.storage.getConnections())
					)
				),
				conn
			);
		});
	}
	receiveConnections(protocol: string, conn: LibP2pConnection) {
		conn.getPeerInfo(peerInfo => {
			if (this.syncInProgress) this.node.hangup(peerInfo);

			this.syncInProgress = true;
			let updateTime = this.storage.getConnectionsTime();
			pull(
				conn,
				pull.map(data => {
					let str = data.toString();
					const delimiterIndex = str.indexOf(scoreKeeperDelimiter);
					if (delimiterIndex != -1) {
						const strParts = str.split(scoreKeeperDelimiter);
						str = strParts[1];
						const time = parseInt(strParts[0]);
						if (time >= updateTime)
							throw new Error('already up to date');
						else updateTime = time;
					}
					return str;
				}),
				pull.drain(data => {
					const obj:{[k:string]: Connection} = JSON.parse(data.toString('utf8'));
					this.storage.replaceConnections(updateTime, obj);
					this.storage.save();
				})
			);

			this.syncInProgress = false;
			this.node.hangup(peerInfo);
		});
	}
	postLastConnection() {
		this.node.pubsub.publish(
			this.gathering + '-scoresync',
			BufferJson({
				time: this.storage.getConnectionsTime(),
				peerInfo: this.node.peerInfo
			})
		);
	}
	postRankings() {
		this.node.pubsub.publish(this.gathering, BufferJson(this.storage.getRankings()));
	}

	receiveRecommendation(conn: any) {
		// Check to see if we've connected with the person that is sending this
		conn.getPeerInfo(peerInfo => {
			const fromContact = this.storage.getContact(peerInfo.id);
			if (fromContact == null) {
				this.node.hangup(peerInfo); // If not, hangup... We don't talk to strangers
			} else {
				// Otherwise pull the data and add it to the recommendations
				pull(
					conn,
					pull.drain(data => {
						const obj: Recommendation = JSON.parse(data.toString('utf8'));

						// If we already have that recommendation, do nothing.
						if (this.storage.getRecommendation(obj.hash) != null)
							return;

						// Otherwise add that person as a recommendation
						this.storage.addRecommendation(obj);
						this.storage.save();

						// Announce the recommendation
						this.announceForScoreKeeper({
							from: this.hash,
							to: obj.hash,
							recommender: fromContact.hash
						});
					})
				);
			}
		});
	}
	sendRecommendation(recipientPeerId: string, recommendedPeerId: string) {
		// Prep contact info for recommendation by removing PII
		const recommendationDetails = Object.assign(
			{},
			this.storage.getContact(recommendedPeerId)
		);
		PII.forEach(k => {
			delete recommendationDetails[k];
		});

		// Dial peer and send recommendation
		const destinationContact = this.storage.getContact(recipientPeerId);
		this.node.dialProtocol(
			destinationContact.peerInfo,
			this.gathering + '-recommendation',
			(err, conn) => {
				pull(pull.once(BufferJson(recommendationDetails)), conn);
			}
		);
	}

	swapContactInfo(targetCodename: string) {
		// Determine the topic for the meeting
		const topic = this.codename + targetCodename;

		// Go into pubsub channel to share peerId
		let contactPeerInfo = null;
		this.node.pubsub.subscribe(topic, ({data}) => {
			this.node.pubsub.unsubscribe(topic);
			contactPeerInfo = JSON.parse(data.toString('utf8'));

			// When we get the peer info from the other end, get ready to handle a connection
			this.node.handle(topic, (protocol: string, conn: LibP2pConnection) => {
				let contactHash = null;
				pull(
					conn,
					pull.drain(data => {
						data = JSON.parse(data.toString('utf8'));
						contactHash = hash({
							gathering: this.gathering,
							codename: targetCodename
						});

						this.storage.addContact(new Contact({
							...data,
							peerInfo: contactPeerInfo,
							hash: contactHash
						}));
						this.storage.save();
					})
				);

				// Announce the connection
				this.announceForScoreKeeper({
					from: this.hash,
					to: contactHash
				});

				this.node.hangup(contactPeerInfo);
				this.node.unhandle(topic);
			});

			// When we have their peer info, send our contact info
			this.node.dialProtocol(contactPeerInfo, topic, (err, conn) => {
				clearInterval(interval);
				pull(pull.once(BufferJson(this.node.peerInfo)), conn);
			});
		});

		// Repeatedly publish this nodes peer info until we receive the peer info from the other end
		const pubMyPeerInfo = () =>
			this.node.pubsub.publish(topic, BufferJson(this.node.peerInfo));
		const interval = setInterval(pubMyPeerInfo, 500);
		pubMyPeerInfo();
	}

	sendStar(peerId: string) {
		// Add to contact
		const contact = this.storage.getContact(peerId);
		contact.stars++;
    // do we need to decrement the sender's star balance here? not sure exactly how to do that, as I don't see where they are minted
		this.storage.save();

		// Announce the stars
		this.announceForScoreKeeper({
			from: this.hash,
			to: contact.hash,
      // I think the scorekeepers might already have the recommender info, but it's possible that the 
      // same match could have been recommended by two different people, so we might want to track 
      // and report the first one to make it.  Or we could prevent redundant recommendations, which might be better
      // from a UX perspective, rather than have users upset that their unknowingly duplicative recommendation didn't count
      recommender: fromContact.hash
			star: contact.stars
		});
	}
}
