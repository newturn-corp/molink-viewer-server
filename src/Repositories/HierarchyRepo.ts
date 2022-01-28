import {
    BaseRepo
} from '@newturn-develop/molink-utils'
import { HierarchyChildrenOpenRepoName, HierarchyRepoName } from '@newturn-develop/molink-constants'
import Automerge from 'automerge'
import {
    convertAutomergeDocumentToDBArray,
    convertDBArrayToAutomergeDocument
} from '@newturn-develop/molink-automerge-wrapper'

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
        return convertDBArrayToAutomergeDocument(item.automergeValue)
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
        return convertDBArrayToAutomergeDocument(item.automergeValue)
    }

    saveHierarchyChildrenOpen (hierarchyKey: string, automergeValue: Automerge.FreezeObject<any>) {
        return this._insertToDynamo(HierarchyChildrenOpenRepoName, {
            hierarchyKey,
            automergeValue: convertAutomergeDocumentToDBArray(automergeValue)
        })
    }
}

export default new HierarchyRepo()
