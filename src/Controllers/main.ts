import { JsonController, Get, CurrentUser, Param } from 'routing-controllers'
import User from '../Domains/User'
import { makeEmptyResponseMessage, makeResponseMessage } from '../DTO/Common'
import { DocumentHierarchyInfoNotMatching, DocumentNotExist, HierarchyUserNotExists, UnauthorizedForDocument } from '../Errors/DocumentError'
import { CustomHttpError } from '../Errors/HttpError'
import DocumentService from '../Services/DocumentService'

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Get('/documents/:id')
    async getDocument (@CurrentUser() user: User, @Param('id') id: string) {
        try {
            const dto = await DocumentService.getDocument(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof DocumentNotExist) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/hierarchy/:nickname')
    async getDocumentHierarchyByNickname (@CurrentUser() user: User, @Param('nickname') nickname: string) {
        try {
            const arr = await DocumentService.getHierarchy(user, nickname)
            return makeResponseMessage(200, arr)
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

    @Get('/hierarchy/documents/:id')
    async getDocumentHierarchyByID (@CurrentUser() user: User, @Param('id') nickname: string) {
        try {
            const arr = await DocumentService.getHierarchy(user, nickname)
            return makeResponseMessage(200, arr)
        } catch (err) {
            if (err instanceof HierarchyUserNotExists) {
                throw new CustomHttpError(404, 1, '유저가 존재하지 않습니다.')
            } else if (err instanceof DocumentHierarchyInfoNotMatching) {
                throw new CustomHttpError(400, 1, '예상치 못한 에러가 발생했습니다.')
            } else if (err instanceof UnauthorizedForDocument) {
                throw new CustomHttpError(403, 1, '문서에 대한 권한이 없습니다.')
            } else {
                throw err
            }
        }
    }
}

export default MainController
