import { ViewerAPI } from '../API/ViewerAPI'
import { User } from '@newturn-develop/types-molink'
import { UnauthorizedForPage } from '../Errors/PageError'
import ESCommentRepo from '../Repositories/ESCommentRepo'

export class CommentService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    async getPageComments (user: User, pageId: string) {
        const authority = await this.viewerAPI.getPageAuthority(pageId)
        if (!authority.viewable) {
            throw new UnauthorizedForPage()
        }
        const comments = await ESCommentRepo.getPageComments(pageId)
        return comments
    }
}
