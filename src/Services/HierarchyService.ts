import {
    HierarchyNotExists
} from '../Errors/DocumentError'
import {
    GetHierarcyResponseDTO,
    HierarchyDocumentInfoInterface,
    User
} from '@newturn-develop/types-molink'
import HierarchyRepo from '../Repositories/HierarchyRepo'
import * as Y from 'yjs'
import AuthorityService from './AuthorityService'

class HierarchyService {
    private async _filterHierarchy (hierarchy: Y.Doc, userId: number, viewer: User): Promise<Y.Doc> {
        const isFollower = viewer && await AuthorityService.checkIsFollower(userId, viewer.id)
        hierarchy.transact(() => {
            const map = hierarchy.getMap<HierarchyDocumentInfoInterface>('documentHierarchyInfoMap')
            const topLevelDocumentIdList = hierarchy.getArray('topLevelDocumentIdList')
            const newTopLevelDocumentIdList = []
            for (const page of map.values()) {
                const viewable = AuthorityService.checkDocumentViewable(viewer, page, isFollower)
                if (viewable) {
                    if (!page.parentId) {
                        newTopLevelDocumentIdList.push(page.id)
                    }
                    page.childrenOpen = false
                    map.set(page.id, page)
                    continue
                }
                map.delete(page.id)
            }
            for (const page of map.values()) {
                const newChildren = page.children.filter((childID: string) => map.get(childID))
                for (const [index, childID] of newChildren.entries()) {
                    const child = map.get(childID) as HierarchyDocumentInfoInterface
                    child.order = index
                    map.set(childID, child)
                }
                page.children = newChildren
                map.set(page.id, page)
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
