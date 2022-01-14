import Document, { DocumentVisibility } from '../Domains/Document'
import DocumentAuthority from '../Domains/DocumentAuthority'
import DocumentHierarchyInfo from '../Domains/DocumentFilesystemInfo'
import User from '../Domains/User'
import { DocumentHierarchyDTO, GetDocumentViewInfoResponseDTO } from '../DTO/DocumentDto'
import { DocumentHierarchyInfoNotMatching, DocumentNotExist, HierarchyUserNotExists, UnauthorizedForDocument } from '../Errors/DocumentError'
import ContentRepo from '../Repositories/ContentRepo'
import DocumentRepo from '../Repositories/DocumentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import UserRepo from '../Repositories/UserRepo'

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
        const dto = new GetDocumentViewInfoResponseDTO(authority)
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

    async getHierarchy (viewer: User, nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new HierarchyUserNotExists()
        }
        const rawDocumentHierarchyInfoList = await DocumentRepo.getDocumentHierarchyInfoListByUserId(user.id)
        if (!rawDocumentHierarchyInfoList) {
            return []
        }
        const hierarchyInfoMap = new Map<string, DocumentHierarchyInfo>()
        rawDocumentHierarchyInfoList.forEach(info => {
            hierarchyInfoMap.set(info.id, info)
        })

        const rawDocumentChildrenOpenList = await DocumentRepo.getDocumentChildrenOpenListByUserIdAndViewerId(user.id, viewer.id)
        const childrenOpenMap = new Map<string, boolean>()
        rawDocumentChildrenOpenList.forEach(info => {
            childrenOpenMap.set(info.documentId, true)
        })

        const isFollower = await this.checkIsFollower(user.id, viewer.id)

        const rawDocuments = await DocumentRepo.getDocumentsByUserId(user.id)
        return rawDocuments
            .filter(document => this.checkUserDocumentViewable(viewer, document, isFollower))
            .map(raw => {
                const hierarchyInfo = hierarchyInfoMap.get(raw.hierarchyInfoId)
                if (!hierarchyInfo) {
                    throw new DocumentHierarchyInfoNotMatching()
                }
                return new DocumentHierarchyDTO(raw.id, raw.title, raw.icon, hierarchyInfo.order, hierarchyInfo.parentId, childrenOpenMap.has(raw.id))
            })
    }

    async getDocumentHierarchyInfo (viewer: User, documentId: string) {
        const document = await DocumentRepo.getDocument(documentId)
        if (!document) {
            throw new DocumentNotExist()
        }

        const isFollower = await this.checkIsFollower(document.userId, viewer.id)
        if (!this.checkUserDocumentViewable(viewer, document, isFollower)) {
            throw new UnauthorizedForDocument()
        }

        const hierarchyInfo = await DocumentRepo.getDocumentHierarchyInfoListByID(document.hierarchyInfoId)
        if (!hierarchyInfo) {
            throw new DocumentHierarchyInfoNotMatching()
        }

        const rawDocumentChildrenOpen = await DocumentRepo.getDocumentChildrenOpen(documentId, viewer.id)

        return new DocumentHierarchyDTO(document.id, document.title, document.icon, hierarchyInfo.order, hierarchyInfo.parentId, !!rawDocumentChildrenOpen)
    }
}
export default new DocumentService()
