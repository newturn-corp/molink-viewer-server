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

@JsonController('/security')
export class SecurityController {
    @Authorized()
    @Get('/file')
    async issueFileUploadSecurity () {
        const dto = await SecurityService.issueSecurity()
        return makeResponseMessage(200, dto)
    }
}
