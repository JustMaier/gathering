import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'
import GatheringDB from './GatheringDB'

const db = new GatheringDB(IPFS, OrbitDB)
export default db
