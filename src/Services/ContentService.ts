import Document, { DocumentVisibility } from '../Domains/Document'
import User from '../Domains/User'
import {
    DocumentNotExist
} from '../Errors/DocumentError'
import ContentRepo from '../Repositories/ContentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import { DocumentContentInterface, GetContentResponseDTO } from '@newturn-develop/types-molink'
import { ContentNotExists, ContentUserNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import UserRepo from '../Repositories/UserRepo'
import { convertAutomergeDocumentForNetwork } from '@newturn-develop/molink-automerge-wrapper'

class ContentService {
    checkUserViewable (user: User, documentUserId: number, visibility: DocumentVisibility, isFollower: boolean) {
        // 1. 공개된 문서면 무조건 성공
        if (visibility === DocumentVisibility.Public) {
            return true
        }

        // 2. 로그인 하지 않은 경우, 공개된 문서가 아니므로 무조건 실패
        if (!user) {
            return false
        }

        // 3. 주인인 경우 무조건 성공
        if (documentUserId === user.id) {
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

    async checkIsFollower (targetId: number, viewerId: number) {
        const followers = await FollowerRepo.getUserFollowers(targetId)
        return followers.map(follower => follower.id).includes(viewerId)
    }

    checkDocumentEditable (user: User, document: Document) {
        // 3. 주인인 경우 무조건 성공
        return document.userId === user.id
    }

    async getContent (viewer: User, documentId: string) {
        const content = await ContentRepo.getContent(documentId) as DocumentContentInterface
        if (!content) {
            throw new ContentNotExists()
        }
        const contentUser = await UserRepo.getActiveUserById(content.userId)
        if (!contentUser) {
            throw new ContentUserNotExists()
        }
        const hierarchy = await HierarchyRepo.getHierarchy(content.userId)
        if (!hierarchy) {
            throw new ContentUserNotExists()
        }
        const document = hierarchy.map[documentId]
        if (!document) {
            throw new DocumentNotExist()
        }
        const isFollower = viewer && await this.checkIsFollower(contentUser.id, viewer.id)
        const isViewable = this.checkUserViewable(viewer, contentUser.id, document.visibility, isFollower)
        if (isViewable) {
            throw new UnauthorizedForContent()
        }
        return new GetContentResponseDTO(convertAutomergeDocumentForNetwork(content))
    }
}
export default new ContentService()
