import { JsonController, Get, CurrentUser, Param, Req, Body, QueryParam, Authorized } from 'routing-controllers'
import {
    GetFollowPageListDTO,
    GetUserInfoByUserMapDTO,
    GetUserPageListDTO,
    makeEmptyResponseMessage,
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import {
    DocumentHierarchyInfoNotMatching,
    DocumentNotExist, DocumentUserNotExists,
    HierarchyNotExists,
    HierarchyUserNotExists
} from '../Errors/DocumentError'
import { CustomHttpError } from '../Errors/HttpError'
import HierarchyService from '../Services/HierarchyService'
import ContentService from '../Services/ContentService'
import { ContentNotExists, ContentUserNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import AuthorityService from '../Services/AuthorityService'
import UserService from '../Services/UserService'
import { UserNotExists } from '../Errors/Common'
import { TooManyUserRequestError } from '../Errors/UserError'
import BlogService from '../Services/BlogService'
import PageService from '../Services/PageService'
import { PageNotExists, UnauthorizedForPage } from '../Errors/PageError'

@JsonController('/pages')
export class PageController {
    @Get('/:id/summary')
    async getAuthority (@CurrentUser() user: User, @Param('id') id: string) {
        try {
            const dto = await PageService.getPageSummary(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof UnauthorizedForPage) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/like')
    @Authorized()
    async getUserPageLike (@CurrentUser() user: User, @Param('id') id: string) {
        const dto = await PageService.getUserLikePage(user, id)
        return makeResponseMessage(200, dto)
    }
}

export default PageController
