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
import AuthorityService from './AuthorityService'

class HierarchyService {
    private async _filterHierarchy (hierarchy: Y.Doc, userId: number, viewer: User): Promise<Y.Doc> {
        const isFollower = viewer && await AuthorityService.checkIsFollower(userId, viewer.id)
        hierarchy.transact(() => {
            const map = hierarchy.getMap('documentHierarchyInfoMap')
            const topLevelDocumentIdList = hierarchy.getArray('topLevelDocumentIdList')
            const newTopLevelDocumentIdList = []
            for (const document of map.values()) {
                const viewable = AuthorityService.checkDocumentVisible(viewer, document, isFollower)
                if (viewable) {
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

    public async getHierarchy (viewer: User, userId: number) {
        const hierarchy = await HierarchyRepo.getHierarchy(userId)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const filteredHierarchy = viewer && viewer.id === userId ? hierarchy : await this._filterHierarchy(hierarchy, userId, viewer)
        return new GetHierarcyResponseDTO(Array.from(Y.encodeStateAsUpdate(filteredHierarchy)))
    }
}
export default new HierarchyService()
