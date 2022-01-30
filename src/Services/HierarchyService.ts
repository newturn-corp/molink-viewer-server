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
    GetHierarcyResponseDTO,
    HierarchyChildrenOpenInfoInterface,
    HierarchyDocumentInfoInterface,
    HierarchyInfoInterface
} from '@newturn-develop/types-molink'
import {
    getAutomergeDocumentFromRedis,
    setAutomergeDocumentAtRedis
} from '@newturn-develop/molink-utils'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import {
    convertAutomergeDocumentForNetwork
} from '@newturn-develop/molink-automerge-wrapper'
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
        const isFollower = viewer && await this.checkIsFollower(user.id, viewer.id)
        const map: {
            [index: string]: HierarchyDocumentInfoInterface
        } = {}
        const topLevelDocumentIdList: string[] = []
        Object.values(hierarchy.map).forEach(document => {
            if (this.checkUserViewable(viewer, document.userId, document.visibility, isFollower)) {
                return
            }
            map[document.id] = document
            if (!document.parentId) {
                topLevelDocumentIdList.push(document.id)
            }
        })
        topLevelDocumentIdList.sort((a, b) => map[a].order - map[b].order)

        return Automerge.from<HierarchyInfoInterface>({
            map,
            topLevelDocumentIdList,
            lastUsedAt: new Date()
        })
    }

    public async getHierarchy (viewer: User, nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new HierarchyUserNotExists()
        }

        const hierarchy = await HierarchyRepo.getHierarchy(user.id)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const filteredHierarchy = viewer && viewer.id === user.id ? hierarchy : await this._filterHierarchy(hierarchy, user, viewer)
        const hierarchyChildrenOpen = await this._getRawHierarchyChildrenOpenMap(user, viewer)
        return new GetHierarcyResponseDTO(convertAutomergeDocumentForNetwork(filteredHierarchy), convertAutomergeDocumentForNetwork(hierarchyChildrenOpen))
    }
}
export default new HierarchyService()
