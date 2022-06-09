import ContentRepo from '../Repositories/ContentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import {
    DocumentVisibility, ESPageSummary, ESPageSummaryWithVisibility,
    GetDocumentAuthorityDTO,
    HierarchyDocumentInfoInterface, PageVisibility,
    User
} from '@newturn-develop/types-molink'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import { PageNotExist, DocumentUserNotExists, HierarchyNotExists } from '../Errors/DocumentError'
import UserRepo from '../Repositories/UserRepo'
import { numberToPageVisibility } from '../Utils/NumberToPageVisibility'
import CacheService from './CacheService'
import { Slack } from '@newturn-develop/molink-utils'
import env from '../env'
import { UserNotExists } from '../Errors/Common'

class AuthorityService {
    checkPageViewable (viewer: User, hierarchyDocumentInfo: HierarchyDocumentInfoInterface, isFollower: boolean) {
        const {
            visibility,
            userId: documentUserId
        } = hierarchyDocumentInfo
        // 1. 공개된 문서면 무조건 성공
        if (visibility === PageVisibility.Public) {
            return true
        }

        // 2. 로그인 하지 않은 경우, 공개된 문서가 아니므로 무조건 실패
        if (!viewer) {
            return false
        }

        // 3. 주인인 경우 무조건 성공
        if (documentUserId === viewer.id) {
            return true
        }

        // 4. 비공개 문서인 경우, 주인이 아니므로 무조건 실패
        if (visibility === PageVisibility.Private) {
            return false
        }

        // 5. 친구 공개 문서인 경우
        if (visibility === PageVisibility.OnlyFollower) {
            return isFollower
        }
        throw new Error('Unhandled Document Viewable')
    }

    checkPageViewableForESSummary (viewer: User, pageOwnerID: number, visibilityNumber: number, isFollower: boolean) {
        const visibility = numberToPageVisibility(visibilityNumber)
        // 1. 공개된 문서면 무조건 성공
        if (visibility === PageVisibility.Public) {
            return true
        }

        // 2. 로그인 하지 않은 경우, 공개된 문서가 아니므로 무조건 실패
        if (!viewer) {
            return false
        }

        // 3. 주인인 경우 무조건 성공
        if (pageOwnerID === viewer.id) {
            return true
        }

        // 4. 비공개 문서인 경우, 주인이 아니므로 무조건 실패
        if (visibility === PageVisibility.Private) {
            return false
        }

        // 5. 친구 공개 문서인 경우
        if (visibility === PageVisibility.OnlyFollower) {
            return isFollower
        }
        throw new Error('Unhandled Page Visibility')
    }

    checkDocumentEditable (viewer: User, hierarchyDocumentInfo: HierarchyDocumentInfoInterface) {
        return viewer.id === hierarchyDocumentInfo.userId
    }

    async checkIsFollower (targetId: number, viewerId: number) {
        const followers = await FollowerRepo.getUserFollowers(targetId)
        return followers.map(follower => follower.id).includes(viewerId)
    }

    async getPageHierarchyInfo (pageId: string): Promise<HierarchyDocumentInfoInterface> {
        try {
            const rawPage = await CacheService.hierarchy.get(`page-${pageId}`)
            if (rawPage) {
                return JSON.parse(rawPage)
            }
        } catch (err) {
            await Slack.sendTextMessage('Redis Error In Viewer Server', env.isProduction ? 'C02SE9VA8TC' : 'C02TWKQHJ64')
        }
        const content = await ContentRepo.getContent(pageId)
        if (!content) {
            throw new PageNotExist()
        }
        const info = content.getMap('info')
        const pageUserId = info.get('userId') as number
        const pageUser = await UserRepo.getActiveUserById(pageUserId)
        if (!pageUser) {
            throw new DocumentUserNotExists()
        }

        const hierarchyPageInfo = await HierarchyRepo.getHierarchyPageInfo(pageUserId, pageId)
        if (!hierarchyPageInfo) {
            throw new PageNotExist()
        }
        try {
            await CacheService.hierarchy.setWithEx(`page-${pageId}`, JSON.stringify(hierarchyPageInfo), 1800)
        } catch (err) {
            await Slack.sendTextMessage('Redis Error In Viewer Server', env.isProduction ? 'C02SE9VA8TC' : 'C02TWKQHJ64')
        }
        return hierarchyPageInfo
    }

    async getPageAuthorityByPageId (viewer: User, pageId: string) {
        const hierarchyPageInfo = await this.getPageHierarchyInfo(pageId)
        const pageUserId = hierarchyPageInfo.userId
        const pageUser = await UserRepo.getActiveUserById(pageUserId)
        if (!pageUser) {
            throw new UserNotExists()
        }

        const isFollower = viewer && await this.checkIsFollower(pageUserId, viewer.id)
        const viewable = this.checkPageViewable(viewer, hierarchyPageInfo, isFollower)
        const editable = this.checkDocumentEditable(viewer, hierarchyPageInfo)
        if (!viewable) {
            return new GetDocumentAuthorityDTO(null, null, null, viewable, editable)
        }
        return new GetDocumentAuthorityDTO(pageUserId, pageUser.nickname, hierarchyPageInfo.title, viewable, editable)
    }
}
export default new AuthorityService()
