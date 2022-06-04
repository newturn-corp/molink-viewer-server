import {
    User
} from '@newturn-develop/types-molink'
import { ContentNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import { ViewerAPI } from '../API/ViewerAPI'
import ESPageRepo from '../Repositories/ESPageRepo'

export class ContentService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    public async getContent (viewer: User, pageId: string) {
        const viewable = (await this.viewerAPI.getPageAuthority(pageId)).viewable
        if (!viewable) {
            throw new UnauthorizedForContent()
        }
        const content = await ESPageRepo.getPageRawContent(pageId)
        if (!content) {
            throw new ContentNotExists()
        }
        return {
            rawContent: content
        }
    }
}
