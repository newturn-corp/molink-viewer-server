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
    PageNotExist, DocumentUserNotExists,
    HierarchyNotExists,
    HierarchyUserNotExists
} from '../Errors/DocumentError'
import { CustomHttpError } from '../Errors/HttpError'
import { ContentNotExists, ContentUserNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import AuthorityService from '../Services/AuthorityService'
import { Request } from 'express'
import { ViewerAPI } from '../API/ViewerAPI'
import { ContentService } from '../Services/ContentService'
import { ViewLogService } from '../Services/ViewLogService'

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Get('/documents/:documentId/authority')
    async getAuthority (@CurrentUser() user: User, @Param('documentId') documentId: string) {
        try {
            const dto = await AuthorityService.getPageAuthorityByPageId(user, documentId)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExist) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else if (err instanceof HierarchyNotExists) {
                throw new CustomHttpError(404, 2, '하이어라키가 존재하지 않습니다.')
            } else if (err instanceof DocumentUserNotExists) {
                throw new CustomHttpError(404, 3, '사용자가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/pages/:pageId/authority')
    async getPageAuthority (@CurrentUser() user: User, @Param('pageId') pageId: string) {
        try {
            const dto = await AuthorityService.getPageAuthorityByPageId(user, pageId)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExist) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else if (err instanceof HierarchyNotExists) {
                throw new CustomHttpError(404, 2, '하이어라키가 존재하지 않습니다.')
            } else if (err instanceof DocumentUserNotExists) {
                throw new CustomHttpError(404, 3, '사용자가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/contents/:id')
    async getContent (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        try {
            const contentService = new ContentService(new ViewerAPI(req))
            const viewLogService = new ViewLogService()
            viewLogService.savePageViewLog(req, user, id)
            const dto = await contentService.getContent(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof ContentNotExists) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else if (err instanceof ContentUserNotExists) {
                throw new CustomHttpError(404, 2, '사용자가 존재하지 않습니다.')
            } else if (err instanceof UnauthorizedForContent) {
                throw new CustomHttpError(409, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }
}

export default MainController
