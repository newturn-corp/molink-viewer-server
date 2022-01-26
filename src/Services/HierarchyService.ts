import Automerge from 'automerge'
import { DocumentVisibility } from '../Domains/Document'
import User from '../Domains/User'
import {
    HierarchyNotExists,
    HierarchyUserNotExists
} from '../Errors/DocumentError'
import FollowerRepo from '../Repositories/FollowRepo'
import UserRepo from '../Repositories/UserRepo'
import CacheService from './CacheService'
import {
    GetHierarchyChildrenOpenDTO,
    GetHierarcyResponseDTO,
    HierarchyChildrenOpenInfoInterface,
    HierarchyComponentBlockInterface,
    HierarchyDocumentInfoInterface,
    HierarchyInfoInterface
} from '@newturn-develop/types-molink'
import {
    convertDBStringToAutomergeDocument,
    getAutomergeDocumentFromRedis,
    setAutomergeDocumentAtRedis
} from '@newturn-develop/molink-utils'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import { convertAutomergeDocumentForRestAPI } from '@newturn-develop/molink-automerge-wrapper'
import { getHierarchyCacheKey, getHierarchyChildrenOpenCacheKey } from '@newturn-develop/molink-constants'

class HierarchyService {
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

    private async checkIsFollower (targetId: number, userId: number) {
        const followers = await FollowerRepo.getUserFollowers(targetId)
        if (followers.map(follower => follower.id).includes(userId)) {
            return true
        } else {
            return false
        }
    }

    private async _getRawHierarchy (user: User) {
        // 캐싱되어있으면 Return
        const cache = await getAutomergeDocumentFromRedis(CacheService.hierarchyRedis, getHierarchyCacheKey(user.id))
        if (cache) {
            return cache
        }

        const hierarchy = await HierarchyRepo.getHierarchy(user.id) as any
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        await setAutomergeDocumentAtRedis(CacheService.hierarchyRedis, getHierarchyCacheKey(user.id), hierarchy)
        return hierarchy
    }

    private async _getRawHierarchyChildrenOpenMap (user: User, viewer: User | null) {
        if (!viewer) {
            return Automerge.from<HierarchyChildrenOpenInfoInterface>({
                map: {},
                lastUsedAt: new Date()
            })
        }
        const hierarchyKey = `${user.id}-${viewer.id}`
        const cache = await getAutomergeDocumentFromRedis(CacheService.hierarchyRedis, getHierarchyChildrenOpenCacheKey(user.id, viewer.id))
        if (cache) {
            return cache
        }

        let hierarchyChildrenOpen = await HierarchyRepo.getHierarchyChildrenOpen(hierarchyKey) as any
        if (!hierarchyChildrenOpen) {
            hierarchyChildrenOpen = Automerge.from<HierarchyChildrenOpenInfoInterface>({
                map: {},
                lastUsedAt: new Date()
            })
            await HierarchyRepo.saveHierarchyChildrenOpen(hierarchyKey, hierarchyChildrenOpen)
        }
        await setAutomergeDocumentAtRedis(CacheService.hierarchyRedis, getHierarchyChildrenOpenCacheKey(user.id, viewer.id), hierarchyChildrenOpen)
        return hierarchyChildrenOpen
    }

    private async _filterHierarchy (hierarchy: Automerge.FreezeObject<HierarchyInfoInterface>, user: User, viewer: User): Promise<Automerge.FreezeObject<HierarchyInfoInterface>> {
        const isFollower = await this.checkIsFollower(user.id, viewer.id)
        const documents = Object.values(hierarchy.map).filter(document => this.checkUserViewable(viewer, document.userId, document.visibility, isFollower))

        const tempMap = new Map<string, HierarchyComponentBlockInterface>()
        const documentMap: Map<string, HierarchyDocumentInfoInterface> = new Map<string, HierarchyDocumentInfoInterface>()
        documents.forEach(document => {
            documentMap.set(document.id, document)
            tempMap.set(document.id, { id: document.id, children: [] })
        })
        documents.filter(document => document.parentId).forEach(document => {
            const parent = tempMap.get(document.parentId || '')
            if (parent) {
                parent.children.push({ id: document.id, children: [] })
            }
        })
        documents.filter(document => document.parentId).forEach(document => {
            tempMap.delete(document.id)
        })

        return Automerge.from<HierarchyInfoInterface>({
            map: Object.fromEntries(documentMap),
            list: Array.from(tempMap.values()),
            lastUsedAt: new Date()
        })
    }

    public async getHierarchy (viewer: User, nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new HierarchyUserNotExists()
        }

        const rawHierarchy = await this._getRawHierarchy(user)
        const hierarchy = viewer && viewer.id === user.id ? rawHierarchy : await this._filterHierarchy(rawHierarchy, user, viewer)
        const hierarchyChildrenOpen = await this._getRawHierarchyChildrenOpenMap(user, viewer)
        return new GetHierarcyResponseDTO(convertAutomergeDocumentForRestAPI(hierarchy), convertAutomergeDocumentForRestAPI(hierarchyChildrenOpen))
    }
}
export default new HierarchyService()
