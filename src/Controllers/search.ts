import { JsonController, Get, QueryParam } from 'routing-controllers'
import {
    makeResponseMessage
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { TooManyPageRequestError } from '../Errors/PageError'
import { SearchService } from '../Services/SearchService'
import { TooManyUserRequestError } from '../Errors/UserError'

@JsonController('/search')
export class SearchController {
    // TODO: query 값 validate 필요, 요청 과부화되지 않도록 주의해야함
    @Get('/pages')
    async searchPages (@QueryParam('q') q: string, @QueryParam('from') fromStr: string, @QueryParam('size') sizeStr: string) {
        try {
            const [from, size] = [Number(fromStr), Number(sizeStr)]
            const service = new SearchService()
            const dto = await service.searchPage(q, from, size)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyPageRequestError) {
                throw new CustomHttpError(409, 0, '너무 많은 페이지를 요청했습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/users')
    async searchUsers (@QueryParam('q') q: string, @QueryParam('from') fromStr: string, @QueryParam('size') sizeStr: string) {
        try {
            const [from, size] = [Number(fromStr), Number(sizeStr)]
            const service = new SearchService()
            const dto = await service.searchUser(q, from, size)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '너무 많은 검색 결과를 요청했습니다.')
            } else {
                throw err
            }
        }
    }
}
