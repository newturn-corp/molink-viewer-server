import { JsonController, Get } from 'routing-controllers'
import { makeEmptyResponseMessage } from '../DTO/Common'

@JsonController('')
export class MainController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }
}

export default MainController
