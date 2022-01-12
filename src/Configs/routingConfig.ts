import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/main'

import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'

const routingControllersOptions: RoutingControllersOptions = {
    routePrefix: '/api',
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
