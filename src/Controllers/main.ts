import { JsonController, Get, CurrentUser, Param } from 'routing-controllers'
import User from '../Domains/User'
import { makeEmptyResponseMessage, makeResponseMessage } from '@newturn-develop/types-molink'
import { DocumentHierarchyInfoNotMatching, DocumentNotExist, HierarchyUserNotExists, UnauthorizedForDocument } from '../Errors/DocumentError'
import { CustomHttpError } from '../Errors/HttpError'
import DocumentService from '../Services/DocumentService'
import HierarchyService from '../Services/HierarchyService'

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
    async getHierarchyByNickname (@CurrentUser() user: User, @Param('nickname') nickname: string) {
        try {
            const data = await HierarchyService.getHierarchy(user, nickname)
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
