import { RoutingControllersOptions } from 'routing-controllers'
import { AuthMiddleware } from '../Middlewares/AuthMiddleware'
import { CustomErrorHandler } from '../Middlewares/CustomErrorHandler'
import PageController from '../Controllers/pages'
import { SearchController } from '../Controllers/search'
import BlogController from '../Controllers/blog'
import { UserController } from '../Controllers/users'
import { FileController } from '../Controllers/files'
import { MainController } from '../Controllers/main'
import { PageListController } from '../Controllers/pageList'

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
