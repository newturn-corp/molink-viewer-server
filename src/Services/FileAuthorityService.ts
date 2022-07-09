import User from "../Domains/User";
import {NoticePageVisibilityChangeDTO, PageVisibility} from "@newturn-develop/types-molink";
import PageFileRelationshipRepo from "../Repositories/PageFileRelationshipRepo";
import {ViewerAPI} from "../API/ViewerAPI";

export class FileAuthorityService {
    viewerAPI: ViewerAPI
    constructor(viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    async checkFileAuthority (user: User, pageId: string, handle: string) {
        // 만약 Page에 해당 File이 없다면 조회할 수 없다.
        const relationship = await PageFileRelationshipRepo.getPageFileRelationship(pageId, handle)
        if (!relationship) {
            return false
        }

        const result = await this.viewerAPI.getPageAuthority(pageId)
        return result.viewable
    }

    async handlePageVisibilityChange (user: User, dto: NoticePageVisibilityChangeDTO) {
        // const { pageId, visibility } = dto
        // await FileUploadRepo.setPageVisibilityByPageId(pageId, visibility)
    }
}
