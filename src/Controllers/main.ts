import { JsonController, Get, CurrentUser, Param } from 'routing-controllers'
import User from '../Domains/User'
import { makeEmptyResponseMessage, makeResponseMessage } from '@newturn-develop/types-molink'
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

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Get('/users/:nickname/id')
    async getUserIDByNickname (@Param('nickname') nickname: string) {
        try {
            const dto = await UserService.getUserIDByNickname(nickname)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof UserNotExists) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/documents/:documentId/authority')
    async getAuthority (@CurrentUser() user: User, @Param('documentId') documentId: string) {
        try {
            const dto = await AuthorityService.getDocumentAuthorityByDocumentId(user, documentId)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof DocumentNotExist) {
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
    async getContent (@CurrentUser() user: User, @Param('id') id: string) {
        try {
            const dto = await ContentService.getContent(user, id)
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

    @Get('/hierarchy/:userId')
    async getHierarchyByNickname (@CurrentUser() user: User, @Param('userId') userIDStr: string) {
        try {
            const data = await HierarchyService.getHierarchy(user, Number(userIDStr))
            return makeResponseMessage(200, data)
        } catch (err) {
            if (err instanceof HierarchyUserNotExists) {
                throw new CustomHttpError(404, 1, '유저가 존재하지 않습니다.')
            } else if (err instanceof DocumentHierarchyInfoNotMatching) {
                throw new CustomHttpError(400, 1, '예상치 못한 에러가 발생했습니다.')
            } else {
                throw err
            }
        }
    }
}

export default MainController
