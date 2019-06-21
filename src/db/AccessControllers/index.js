import AccessControllers from 'orbit-db-access-controllers'
import IdBoundAccessController from './IdBoundAccessController'
import WriteOnlyAccessController from './WriteOnlyAccessController'

AccessControllers.addAccessController({ AccessController: IdBoundAccessController })
AccessControllers.addAccessController({ AccessController: WriteOnlyAccessController })

export default AccessControllers
