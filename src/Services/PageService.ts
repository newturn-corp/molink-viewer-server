import ESPageRepo from '../Repositories/ESPageRepo'
import User from '../Domains/User'
import { PageNotExists, UnauthorizedForPage } from '../Errors/PageError'
import LikeRepo from '../Repositories/LikeRepo'
import { GetUserLikePageResponseDTO } from '@newturn-develop/types-molink'
import { ViewerAPI } from '../API/ViewerAPI'

export class PageService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    async getPageSummary (user: User, pageId: string) {
        const authority = await this.viewerAPI.getPageAuthority(pageId)
        if (!authority.viewable) {
            throw new UnauthorizedForPage()
        }
        const pageSummary = await ESPageRepo.getPageSummaryWithVisibility(pageId)
        if (!pageSummary) {
            throw new PageNotExists()
        }
        return pageSummary.toNormalSummary()
    }

    async getPageMetaInfo (user: User, pageId: string) {
        const authority = await this.viewerAPI.getPageAuthority(pageId)
        if (!authority.viewable) {
            throw new UnauthorizedForPage()
        }
        const pageMetaInfo = await ESPageRepo.getPageMetaInfo(pageId)
        if (!pageMetaInfo) {
            throw new PageNotExists()
        }
        return pageMetaInfo
    }

    async getEditorPageInfo (user: User, pageId: string) {
        const authority = await this.viewerAPI.getPageAuthority(pageId)
        if (!authority.viewable) {
            throw new UnauthorizedForPage()
        }
        const editorPageInfo = await ESPageRepo.getEditorPageInfo(pageId)
        if (!editorPageInfo) {
            throw new PageNotExists()
        }
        return editorPageInfo
    }

    async getUserLikePage (user: User, pageId: string) {
        const isLike = await LikeRepo.checkActiveLikeExists(pageId, user.id)
        return new GetUserLikePageResponseDTO(isLike)
    }
}
