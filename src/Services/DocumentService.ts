import Document, { DocumentVisibility } from '../Domains/Document'
import DocumentAuthority from '../Domains/DocumentAuthority'
import User from '../Domains/User'
import { GetDocumentResponseDTO } from '../DTO/DocumentDto'
import { DocumentNotExist } from '../Errors/DocumentError'
import ContentRepo from '../Repositories/ContentRepo'
import DocumentRepo from '../Repositories/DocumentRepo'
import FollowerRepo from '../Repositories/FollowRepo'

class DocumentService {
    checkUserDocumentViewable (user: User, document: Document, isFollower: boolean) {
        // 1. 공개된 문서면 무조건 성공
        if (document.visibility === DocumentVisibility.Public) {
            return true
        }

        // 2. 로그인 하지 않은 경우, 공개된 문서가 아니므로 무조건 실패
        if (!user) {
            return false
        }

        // 3. 주인인 경우 무조건 성공
        if (document.userId === user.id) {
            return true
        }

        // 4. 비공개 문서인 경우, 주인이 아니므로 무조건 실패
        if (document.visibility === DocumentVisibility.Private) {
            return false
        }

        // 5. 친구 공개 문서인 경우
        if (document.visibility === DocumentVisibility.OnlyFollower) {
            return isFollower
        }
        throw new Error('Unhandled Document Viewable')
    }

    async checkIsFollower (targetId: number, userId: number) {
        const followers = await FollowerRepo.getUserFollowers(targetId)
        if (followers.map(follower => follower.id).includes(userId)) {
            return true
        } else {
            return false
        }
    }

    checkDocumentEditable (user: User, document: Document) {
        // 3. 주인인 경우 무조건 성공
        if (document.userId === user.id) {
            return true
        } else {
            return false
        }
    }

    async getDocument (user: User, documentId: string) {
        const document = await DocumentRepo.getDocument(documentId)
        if (!document) {
            throw new DocumentNotExist()
        }
        const isFollower = await this.checkIsFollower(document.userId, user.id)
        const viewable = await this.checkUserDocumentViewable(user, document, isFollower)
        const editable = this.checkDocumentEditable(user, document)
        const authority = new DocumentAuthority(viewable, editable)
        const dto = new GetDocumentResponseDTO(authority)
        if (viewable) {
            dto.id = document.id
            dto.title = document.title
            dto.icon = document.icon
            dto.visibility = document.visibility
            dto.createdAt = document.createdAt
            dto.updatedAt = document.updatedAt
            dto.userId = document.userId
            dto.content = await ContentRepo.getContent(document.contentId)
        }
        return dto
    }
}
export default new DocumentService()
