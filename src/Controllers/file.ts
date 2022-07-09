import { JsonController, Get, CurrentUser, Param, QueryParam, Req, Authorized, Res } from 'routing-controllers'
import {
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { Request, Response } from 'express'
import { ViewerAPI } from '../API/ViewerAPI'
import { UnauthorizedForContent } from '../Errors/ContentError'
import SecurityService from '../Services/SecurityService'
import { FileAuthorityService } from '../Services/FileAuthorityService'
import axios from 'axios'
import env from '../env'

@JsonController('/file')
export class TestFileController {
    @Get('/docx/:handle')
    async getDocx (@Param('handle') handle: string, @QueryParam('pageId') pageId: string, @CurrentUser() user: User, @Req() req: Request, @Res() res : Response) {
        try {
            const fileAuthorityService = new FileAuthorityService(new ViewerAPI(req))
            const authority = await fileAuthorityService.checkFileAuthority(user, pageId, handle)
            if (!authority) {
                throw new UnauthorizedForContent()
            }
            const response = await axios.get(`https://cdn.filestackcontent.com/${handle}?policy=${env.file.encoded_policy}&signature=${env.file.signature}`, { responseType: 'stream' })
            delete response.headers['access-control-allow-origin']
            res.header(response.headers)
            return response.data
        } catch (err) {
            if (err instanceof UnauthorizedForContent) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:handle')
    async getFile (@Param('handle') handle: string, @QueryParam('pageId') pageId: string, @CurrentUser() user: User, @Req() req: Request, @Res() res : Response) {
        try {
            const fileAuthorityService = new FileAuthorityService(new ViewerAPI(req))
            const authority = await fileAuthorityService.checkFileAuthority(user, pageId, handle)
            if (!authority) {
                throw new UnauthorizedForContent()
            }
            const response = await axios.get(`https://cdn.filestackcontent.com/${handle}?policy=${env.file.encoded_policy}&signature=${env.file.signature}`, { responseType: 'stream' })
            res.header(response.headers)
            return response.data
        } catch (err) {
            if (err instanceof UnauthorizedForContent) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Authorized()
    @Get('/security')
    async issueFileUploadSecurity () {
        const dto = await SecurityService.issueSecurity()
        return makeResponseMessage(200, dto)
    }
}
