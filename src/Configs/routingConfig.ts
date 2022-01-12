import { RoutingControllersOptions } from 'routing-controllers'
import DocumentController from '../Controllers/documents'
import MainController from '../Controllers/main'

import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController,
        DocumentController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
