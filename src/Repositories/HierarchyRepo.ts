import {
    BaseRepo,
    convertAutomergeDocumentToDBString,
    convertDBStringToAutomergeDocument,
    Dynamo
} from '@newturn-develop/molink-utils'
import { HierarchyChildrenOpenRepoName, HierarchyRepoName } from '@newturn-develop/molink-constants'
import Automerge from 'automerge'

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
        return convertDBStringToAutomergeDocument(item.automergeValue)
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
        return convertDBStringToAutomergeDocument(item.automergeValue)
    }

    saveHierarchyChildrenOpen (hierarchyKey: string, automergeValue: Automerge.FreezeObject<any>) {
        return this._insertToDynamo(HierarchyChildrenOpenRepoName, {
            hierarchyKey,
            automergeValue: convertAutomergeDocumentToDBString(automergeValue)
        })
    }
}

export default new HierarchyRepo()
