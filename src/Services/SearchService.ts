import ESPageRepo from '../Repositories/ESPageRepo'
import { TooManyPageRequestError } from '../Errors/PageError'

export class SearchService {
    searchPage (q: string, from: number, size: number) {
        if (size > 10) {
            throw new TooManyPageRequestError()
        }
        return ESPageRepo.searchByText(q, from, size)
    }
}
