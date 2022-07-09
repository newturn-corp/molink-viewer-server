import { JsonController, Get, CurrentUser, Param, Req, Authorized, QueryParam } from 'routing-controllers'
import {
    GetFollowPageListDTO,
    GetPageListDTO, GetUserPageListDTO,
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { TooManyPageRequestError } from '../Errors/PageError'
import { TooManyUserRequestError } from '../Errors/UserError'
import PageListService from '../Services/PageListService'

@JsonController('/page-list')
export class PageListController {
    @Get('/popular')
    async getPopularPageList (@QueryParam('from') from: string, @QueryParam('count') count: string) {
        try {
            const dto = await PageListService.getPopularPageList(new GetPageListDTO(Number(from), Number(count)))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyPageRequestError) {
                throw new CustomHttpError(409, 0, '너무 많은 페이지를 요청했습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/follow')
    async getFollowPageList (@CurrentUser() user: User, @QueryParam('from') from: string, @QueryParam('count') count: string) {
        try {
            const dto = await PageListService.getFollowPageList(user, new GetPageListDTO(Number(from), Number(count)))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/users/:userId')
    async getUserPageList (@CurrentUser() user: User, @Param('userId') userId: string, @QueryParam('from') from: string, @QueryParam('count') count: string) {
        try {
            const dto = await PageListService.getUserPageList(user, Number(userId), new GetPageListDTO(Number(from), Number(count)))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }
}
