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

@JsonController('/test')
export class TestController {
    @Authorized()
    @Get('/security')
    async issueFileUploadSecurity () {
        const dto = await SecurityService.issueSecurity()
        return makeResponseMessage(200, dto)
    }

    @Get('/chicken')
    async chicken () {
        return makeResponseMessage(200, { text: 'hi' })
    }
}
