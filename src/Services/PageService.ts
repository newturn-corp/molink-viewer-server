import ESPageRepo from '../Repositories/ESPageRepo'
import User from '../Domains/User'
import { PageNotExists, UnauthorizedForPage } from '../Errors/PageError'
import AuthorityService from './AuthorityService'

class PageService {
    async getPageSummary (user: User, pageId: string) {
        const pageSummary = await ESPageRepo.getPageSummaryWithVisibility(pageId)
        if (!pageSummary) {
            throw new PageNotExists()
        }
        const isFollower = user && await AuthorityService.checkIsFollower(Number(pageSummary.userId), user.id)
        const viewable = AuthorityService.checkPageViewableForESSummary(user, pageSummary, isFollower)
        if (!viewable) {
            throw new UnauthorizedForPage()
        }
        return pageSummary.toNormalSummary()
    }
}
export default new PageService()
