import { RoutingControllersOptions } from 'routing-controllers'
import MainController from '../Controllers/main'

import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import PageController from '../Controllers/pages'
import PageListController from '../Controllers/pageList'
import { SearchController } from '../Controllers/search'
import BlogController from '../Controllers/blog'
import { UserController } from '../Controllers/users'
import FileController from '../Controllers/files'

const routingControllersOptions: RoutingControllersOptions = {
    defaultErrorHandler: false,
    middlewares: [CustomErrorHandler],
    controllers: [
        FileController,
        MainController,
        PageController,
        PageListController,
        SearchController,
        BlogController,
        UserController
    ],
    authorizationChecker: AuthMiddleware.authorization,
    currentUserChecker: AuthMiddleware.currentUser
}

export { routingControllersOptions }
