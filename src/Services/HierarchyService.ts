import User from '../Domains/User'
import {
    HierarchyNotExists,
    HierarchyUserNotExists
} from '../Errors/DocumentError'
import FollowerRepo from '../Repositories/FollowRepo'
import UserRepo from '../Repositories/UserRepo'
import {
    DocumentVisibility,
    GetHierarcyResponseDTO,
    HierarchyDocumentInfoInterface
} from '@newturn-develop/types-molink'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import * as Y from 'yjs'

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

    private async _filterHierarchy (hierarchy: Y.Doc, user: User, viewer: User): Promise<Y.Doc> {
        const isFollower = viewer && await this.checkIsFollower(user.id, viewer.id)
        hierarchy.transact(() => {
            const map = hierarchy.getMap('map')
            const topLevelDocumentIdList = hierarchy.getArray('topLevelDocumentIdList')
            const newTopLevelDocumentIdList = []
            for (const document of map.values()) {
                if (this.checkUserViewable(viewer, user.id, document.visibility, isFollower)) {
                    if (!document.parentId) {
                        newTopLevelDocumentIdList.push(document.id)
                    }
                    continue
                }
                map.delete(document.id)
            }
            newTopLevelDocumentIdList.sort((a, b) => {
                const aDocument = map.get(a) as HierarchyDocumentInfoInterface
                const bDocument = map.get(b) as HierarchyDocumentInfoInterface
                return aDocument.order - bDocument.order
            })
            topLevelDocumentIdList.delete(0, topLevelDocumentIdList.length)
            topLevelDocumentIdList.insert(0, newTopLevelDocumentIdList)
        })
        return hierarchy
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
        return new GetHierarcyResponseDTO(Array.from(Y.encodeStateAsUpdate(filteredHierarchy)))
    }
}
export default new HierarchyService()
