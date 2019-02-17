import hash from 'object-hash';
import RankingEngine from './ranking-engine';
import Contact from '../models/Contact';
import NodeInfo from '../models/NodeInfo';
import Recommendation from '../models/Recommendation';
import Connection from '../models/Connection';

const toStore = ['contacts', 'recommendations', 'info', 'connections'];
export default class Storage {
	private prefix: string;
	private contacts: {[k:string]: Contact} = {};
	private recommendations: {[k:string]: Recommendation} = {};
	private info: NodeInfo = new NodeInfo();
	private connections: {[k:string]: Connection} = {};
	private gatherings: {[k:string]: string} = {};
	private gatheringName: string;

	constructor(private rankingEngine: RankingEngine) {
		this.load();
	}

	addGathering(gatheringName: string, codeName: string) {
		this.gatherings[gatheringName] = codeName;
		localStorage['gatherings'] = JSON.stringify(this.gatherings);
	}
	getGatherings() {
		return Object.keys(this.gatherings).map(gatheringName => ({
			gatheringName,
			codename: this.gatherings[gatheringName]
		}));
	}
	getCodename() {
		if (this.gatheringName == null)
			throw new Error('a gathering must be selected to get the codename');
		return this.gatherings[this.gatheringName];
	}
	activateGathering(gatheringName: string) {
		if (this.gatherings[gatheringName] == null)
			throw new Error("a codename hasn't been set for this gathering");
		this.gatheringName = gatheringName;
		this.prefix = 'gatherings:' + gatheringName;
	}

	addContact(contact: Contact) {
		this.contacts[contact.peerInfo.id] = contact;
	}
	getContact(peerId: string) {
		return this.contacts[peerId];
	}

	addRecommendation(recommendation: Recommendation) {
		this.recommendations[recommendation.hash] = recommendation;
	}
	getRecommendation(hash: string) {
		return this.recommendations[hash];
	}

	getConnections() {
		return this.connections;
	}
	upsertConnection(hash: string, connection: Connection) {
		Object.assign(this.connections[hash] || {}, connection);
		this.info.lastConnection = new Date().getTime();
	}
	replaceConnections(updateTime: number, connections: {[k:string]: Connection}) {
		this.connections = connections;
		this.info.lastConnection = updateTime;
	}
	getConnectionsTime() {
		return this.info.lastConnection || 0;
	}

	setInfo(info: NodeInfo) {
		Object.assign(this.info || {}, info);
	}
	getInfo() {
		return this.info;
	}

	getRankings() {
		const {scores, rankings} = this.rankingEngine.rank(this.connections);
		return {scores, rankings};
	}

	save() {
		toStore.forEach(
			k => (localStorage[`${this.prefix}.${k}`] = JSON.stringify(this[k]))
		);
	}
	load() {
		toStore.forEach(
			k =>
				(this[k] = JSON.parse(
					localStorage[`${this.prefix}.${k}`] || '{}'
				))
		);
		this.gatherings = JSON.parse(localStorage['gatherings'] || '{}');
	}
	clear() {
		toStore.forEach(k => {
			this[k] = {};
			delete localStorage[`${this.prefix}.${k}`];
		});
	}
}
