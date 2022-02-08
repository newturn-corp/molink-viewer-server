import User from '../Domains/User'
import ContentRepo from '../Repositories/ContentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import {
    DocumentVisibility,
    GetContentResponseDTO
} from '@newturn-develop/types-molink'
import { ContentNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import * as Y from 'yjs'

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

    public async getContent (viewer: User, documentId: string) {
        const content = await ContentRepo.getContent(documentId)
        if (!content) {
            throw new ContentNotExists()
        }
        const info = content.getMap('info')
        const documentUserId = info.get('userId') as number
        const visibility = info.get('visibility') as DocumentVisibility
        const isFollower = await this.checkIsFollower(documentUserId, viewer.id)
        const isViewable = this.checkUserViewable(viewer, documentUserId, visibility, isFollower)
        if (!isViewable) {
            throw new UnauthorizedForContent()
        }
        return new GetContentResponseDTO(Array.from(Y.encodeStateAsUpdate(content)))
    }
}
export default new ContentService()
