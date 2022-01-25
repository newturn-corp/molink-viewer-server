import { BaseRepo, convertDBStringToAutomergeDocument } from '@newturn-develop/molink-utils'
import { HierarchyChildrenOpenRepoName, HierarchyRepoName } from '@newturn-develop/molink-constants'

class HierarchyRepo extends BaseRepo {
    async getHierarchy (userId: number) {
        const item = await this._selectSingularDynamoByKey(
            HierarchyRepoName,
            'userId = :userId',
            {
                ':userId': userId
            })
        if (!item) {
            return item
        }
        return convertDBStringToAutomergeDocument(item.automergeDocument)
    }

    async getHierarchyChildrenOpen (hierarchyKey: string) {
        const item = await this._selectSingularDynamoByKey(
            HierarchyChildrenOpenRepoName,
            'hierarchyKey = :hierarchyKey',
            {
                ':hierarchyKey': hierarchyKey
            })
        if (!item) {
            return item
        }
        return convertDBStringToAutomergeDocument(item.automergeDocument)
    }
}

export default new HierarchyRepo()
