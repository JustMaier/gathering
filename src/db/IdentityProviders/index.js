import Identities from 'orbit-db-identity-provider'
import Base64IdProvider from './Base64IdProvider'

Identities.addIdentityProvider(Base64IdProvider)

export default Identities
