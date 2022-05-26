import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/main'

import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import PageController from '../Controllers/pages'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        MainController,
        PageController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
