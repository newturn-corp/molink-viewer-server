import Automerge from 'automerge'
import Document, { DocumentVisibility } from '../Domains/Document'
import DocumentAuthority from '../Domains/DocumentAuthority'
import DocumentChildrenOpen from '../Domains/DocumentChildrenOpen'
import User from '../Domains/User'
import { DocumentHierarchyDTO, GetDocumentViewInfoResponseDTO } from '../DTO/DocumentDto'
import { DocumentHierarchyInfoNotMatching, DocumentNotExist, HierarchyUserNotExists, UnauthorizedForDocument } from '../Errors/DocumentError'
import ContentRepo from '../Repositories/ContentRepo'
import DocumentRepo from '../Repositories/DocumentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import UserRepo from '../Repositories/UserRepo'
import { DocumentHierarchyBlock, Hierarchy } from '../Types/Hierarchy'
import CacheService from './CacheService'

class DocumentService {
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

    checkUserDocumentViewable (user: User, document: Document, isFollower: boolean) {
        return this.checkUserViewable(user, document.userId, document.visibility, isFollower)
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
        const viewable = await this.checkUserViewable(user, document.userId, document.visibility, isFollower)
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

    // async getDocumentGeneralHierarchyInfoList (user: User) {
    //     // 캐싱되어있으면 Return
    //     const cachedMap = await CacheService.liveRedis.hgetall(`hierarchy-general-${user.id}`)
    //     if (Object.keys(cachedMap).length > 0) {
    //         const infoList: DocumentGeneralHierarchyInfo[] = []
    //         for (const key in cachedMap) {
    //             if (key === 'lastUsedAt') {
    //                 continue
    //             }
    //             infoList.push(JSON.parse(cachedMap[key]) as DocumentGeneralHierarchyInfo)
    //         }
    //         return infoList
    //     }

    //     const rawDocumentHierarchyInfoList = await DocumentRepo.getDocumentHierarchyInfoListByUserId(user.id)
    //     if (!rawDocumentHierarchyInfoList) {
    //         return []
    //     }
    //     const hierarchyInfoMap = new Map<string, DocumentHierarchyInfo>()
    //     rawDocumentHierarchyInfoList.forEach(info => {
    //         hierarchyInfoMap.set(info.id, info)
    //     })
    //     const rawDocuments = await DocumentRepo.getDocumentsByUserId(user.id)

    //     const generalHierarchyInfoList = rawDocuments.map(document => {
    //         const hierarchyInfo = hierarchyInfoMap.get(document.hierarchyInfoId)
    //         if (!hierarchyInfo) {
    //             throw new DocumentHierarchyInfoNotMatching()
    //         }
    //         return new DocumentGeneralHierarchyInfo(document.id, document.title, document.icon, document.userId, document.visibility, hierarchyInfo.order, hierarchyInfo.parentId)
    //     })

    //     // 캐싱하기
    //     const hierarchy = Automerge.from<Hierarchy>({
    //         map: generalHierarchyInfoList.reduce((prev: any, current: DocumentGeneralHierarchyInfo) => {
    //             prev[current.id] = JSON.stringify(current)
    //             return prev
    //         }, { } as any),
    //         lastUsedAt: new Date()
    //     })
    //     await CacheService.liveRedis.set(`hierarchy-general-${user.id}`, JSON.stringify(Automerge.save(hierarchy)))

    //     return generalHierarchyInfoList
    // }

    async getDocumentChildrenOpenMap (user: User, viewer: User) {
        const childrenOpenMap = new Map<string, boolean>()
        if (viewer) {
            // 캐싱되어있다면 캐싱된 것 리턴
            const cachedMap = await CacheService.liveRedis.hgetall(`hierarchy-children-open-${user.id}-${viewer.id}`)
            if (Object.keys(cachedMap).length > 0) {
                for (const key in cachedMap) {
                    if (key === 'lastUsedAt') {
                        continue
                    }
                    childrenOpenMap.set(key, true)
                }
                return childrenOpenMap
            }

            const rawDocumentChildrenOpenList = await DocumentRepo.getDocumentChildrenOpenListByUserIdAndViewerId(user.id, viewer.id)
            rawDocumentChildrenOpenList.forEach(info => {
                childrenOpenMap.set(info.documentId, true)
            })

            // 캐싱해놓기
            await CacheService.liveRedis.hmset(`hierarchy-children-open-${user.id}-${viewer.id}`, rawDocumentChildrenOpenList.reduce((prev: any, current: DocumentChildrenOpen) => {
                prev[current.documentId] = 'true'
                return prev
            }, {
                lastUsedAt: new Date()
            } as any))
        }
        return childrenOpenMap
    }

    sortAll (documentMap: Map<string, Document>, blocks: DocumentHierarchyBlock[]) {
        return blocks.map(block => {
            if (block.children.length < 2) {
                return block
            }
            block.children = block.children.sort((a, b) => {
                const aOrder = documentMap.get(a.id)?.order as number
                const bOrder = documentMap.get(b.id)?.order as number
                return aOrder - bOrder
            })
            block.children = this.sortAll(documentMap, block.children)
            return block
        })
    }

    async getHierarchy (viewer: User, nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new HierarchyUserNotExists()
        }

        // 캐싱되어있으면 Return
        const cache = await CacheService.liveRedis.get(`hierarchy-general-${user.id}`)
        if (cache) {
            const serializedHierarchy = Uint8Array.from(JSON.parse(cache).data) as any
            serializedHierarchy.__binaryDocument = true
            return serializedHierarchy
        }

        const isFollower = await this.checkIsFollower(user.id, viewer.id)
        const rawDocuments = (await DocumentRepo.getDocumentsByUserId(user.id)).filter(document => this.checkUserDocumentViewable(viewer, document, isFollower))

        const tempMap = new Map<string, DocumentHierarchyBlock>()
        const documentMap: Map<string, Document> = new Map<string, Document>()
        rawDocuments.forEach(document => {
            tempMap.set(document.id, { id: document.id, children: [] })
            documentMap.set(document.id, document)
        })
        rawDocuments.filter(document => document.parentId).forEach(document => {
            const parent = tempMap.get(document.parentId || '')
            if (parent) {
                parent.children.push({ id: document.id, children: [] })
            }
        })
        rawDocuments.filter(document => document.parentId).forEach(document => {
            tempMap.delete(document.id)
        })
        const list = this.sortAll(documentMap, Array.from(tempMap.values()))

        // 캐싱하기
        const hierarchy = Automerge.from<Hierarchy>({
            map: rawDocuments.reduce((prev: any, current: Document) => {
                prev[current.id] = current
                return prev
            }, { } as any),
            list,
            lastUsedAt: new Date()
        })

        const serializedHierarchy = Automerge.save(hierarchy)
        await CacheService.liveRedis.set(`hierarchy-general-${user.id}`, JSON.stringify(Buffer.from(serializedHierarchy)))

        return serializedHierarchy
    }

    // async getDocumentHierarchyChildrenOpen (user: User, viewer: User) {
    //     const childrenOpenMap = new Map<string, boolean>()
    //     if (viewer) {
    //         // 캐싱되어있다면 캐싱된 것 리턴
    //         const cached = await CacheService.liveRedis.hgetall(`hierarchy-children-open-${user.id}-${viewer.id}`)
    //         if (Object.keys(cachedMap).length > 0) {
    //             for (const key in cachedMap) {
    //                 if (key === 'lastUsedAt') {
    //                     continue
    //                 }
    //                 childrenOpenMap.set(key, true)
    //             }
    //             return childrenOpenMap
    //         }

    //         const rawDocumentChildrenOpenList = await DocumentRepo.getDocumentChildrenOpenListByUserIdAndViewerId(user.id, viewer.id)

    //         const obj = rawDocumentChildrenOpenList.reduce((prev: any, current: DocumentChildrenOpen) => {
    //             prev[current.documentId] = 'true'
    //             return prev
    //         }, {
    //             lastUsedAt: new Date()
    //         } as any)

    //         // 캐싱해놓기
    //         await CacheService.liveRedis.hmset(`hierarchy-children-open-${user.id}-${viewer.id}`, rawDocumentChildrenOpenList.reduce(obj)
    //     }
    //     return childrenOpenMap
    // }

    // async getDocumentHierarchyInfo (viewer: User, documentId: string) {
    //     const document = await DocumentRepo.getDocument(documentId)
    //     if (!document) {
    //         throw new DocumentNotExist()
    //     }

    //     const isFollower = await this.checkIsFollower(document.userId, viewer.id)
    //     if (!this.checkUserViewable(viewer, document.userId, document.visibility, isFollower)) {
    //         throw new UnauthorizedForDocument()
    //     }

    //     const hierarchyInfo = await DocumentRepo.getDocumentHierarchyInfoListByID(document.hierarchyInfoId)
    //     if (!hierarchyInfo) {
    //         throw new DocumentHierarchyInfoNotMatching()
    //     }

    //     const rawDocumentChildrenOpen = await DocumentRepo.getDocumentChildrenOpen(documentId, viewer.id)

    //     return new DocumentHierarchyDTO(document.id, document.title, document.icon, hierarchyInfo.order, hierarchyInfo.parentId, !!rawDocumentChildrenOpen)
    // }
}
export default new DocumentService()
