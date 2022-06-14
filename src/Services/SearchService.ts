import ESPageRepo from '../Repositories/ESPageRepo'
import { TooManyPageRequestError } from '../Errors/PageError'
import { PageSearchResultDTO, UserSearchResultDTO } from '@newturn-develop/types-molink'
import ESUserRepo from '../Repositories/ESUserRepo'
import { TooManyUserRequestError } from '../Errors/UserError'

export class SearchService {
    async searchUser (q: string, from: number, size: number) {
        if (size > 10) {
            throw new TooManyUserRequestError()
        }
        const {
            total,
            documents
        } = await ESUserRepo.searchUsers(q, from, size)
        return new UserSearchResultDTO(total, documents)
    }

    async searchPage (q: string, from: number, size: number) {
        if (size > 10) {
            throw new TooManyPageRequestError()
        }
        const { total, documents } = await ESPageRepo.searchByText(q, from, size)
        return new PageSearchResultDTO(total, documents)
    }
}
