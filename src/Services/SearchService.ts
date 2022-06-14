import ESPageRepo from '../Repositories/ESPageRepo'
import { TooManyPageRequestError } from '../Errors/PageError'
import { PageSearchResultDTO } from '@newturn-develop/types-molink'

export class SearchService {
    async searchPage (q: string, from: number, size: number) {
        if (size > 10) {
            throw new TooManyPageRequestError()
        }
        const { total, documents } = await ESPageRepo.searchByText(q, from, size)
        return new PageSearchResultDTO(total, documents)
    }
}
