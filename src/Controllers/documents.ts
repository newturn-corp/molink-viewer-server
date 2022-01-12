import { JsonController, Get, CurrentUser, Param } from 'routing-controllers'
import User from '../Domains/User'
import { makeResponseMessage } from '../DTO/Common'
import { DocumentNotExist } from '../Errors/DocumentError'
import { CustomHttpError } from '../Errors/HttpError'
import DocumentService from '../Services/DocumentService'

@JsonController('/documents')
export class DocumentController {
    @Get('/:id')
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
}

export default DocumentController
