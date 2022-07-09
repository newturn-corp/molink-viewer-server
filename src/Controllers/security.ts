import { JsonController, Get, Authorized } from 'routing-controllers'
import {
    makeResponseMessage
} from '@newturn-develop/types-molink'
import SecurityService from '../Services/SecurityService'

@JsonController('/security')
export class SecurityController {
    @Authorized()
    @Get('/file')
    async issueFileUploadSecurity () {
        const dto = await SecurityService.issueSecurity()
        return makeResponseMessage(200, dto)
    }
}
