export default class Contact{
	public name: string;
	public email: string;
	public company: string;
	public phone: string;
	public peerInfo: PeerInfo;
	public hash: string;
	public stars: number = 0;
	constructor(init?: Partial<Contact>) {
    }
}
