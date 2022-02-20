import User from '../Domains/User'
import ContentRepo from '../Repositories/ContentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import {
    DocumentVisibility,
    GetDocumentAuthorityDTO,
    HierarchyDocumentInfoInterface
} from '@newturn-develop/types-molink'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import { DocumentNotExist, DocumentUserNotExists, HierarchyNotExists } from '../Errors/DocumentError'
import UserRepo from '../Repositories/UserRepo'

class AuthorityService {
    checkDocumentViewable (viewer: User, hierarchyDocumentInfo: HierarchyDocumentInfoInterface, isFollower: boolean) {
        const {
            visibility,
            userId: documentUserId
        } = hierarchyDocumentInfo
        // 1. 공개된 문서면 무조건 성공
        if (visibility === DocumentVisibility.Public) {
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
        if (visibility === DocumentVisibility.Private) {
            return false
        }

        // 5. 친구 공개 문서인 경우
        if (visibility === DocumentVisibility.OnlyFollower) {
            return isFollower
        }
        throw new Error('Unhandled Document Viewable')
    }

    checkDocumentEditable (viewer: User, hierarchyDocumentInfo: HierarchyDocumentInfoInterface) {
        return viewer.id === hierarchyDocumentInfo.userId
    }

    async checkIsFollower (targetId: number, viewerId: number) {
        const followers = await FollowerRepo.getUserFollowers(targetId)
        return followers.map(follower => follower.id).includes(viewerId)
    }

    async getDocumentAuthorityByDocumentId (viewer: User, documentId: string) {
        const content = await ContentRepo.getContent(documentId)
        if (!content) {
            throw new DocumentNotExist()
        }
        const info = content.getMap('info')
        const documentUserId = info.get('userId') as number
        const documentUser = await UserRepo.getActiveUserById(documentUserId)
        if (!documentUser) {
            throw new DocumentUserNotExists()
        }

        const hierarchy = await HierarchyRepo.getHierarchy(documentUserId)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const hierarchyDocumentInfo = hierarchy.getMap('documentHierarchyInfoMap').get(documentId) as HierarchyDocumentInfoInterface

        const isFollower = viewer && await this.checkIsFollower(documentUserId, viewer.id)
        const viewable = this.checkDocumentViewable(viewer, hierarchyDocumentInfo, isFollower)
        const editable = this.checkDocumentEditable(viewer, hierarchyDocumentInfo)
        if (!viewable) {
            return new GetDocumentAuthorityDTO(null, null, null, viewable, editable)
        }
        return new GetDocumentAuthorityDTO(documentUserId, documentUser.nickname, hierarchyDocumentInfo.title, viewable, editable)
    }
}
export default new AuthorityService()
