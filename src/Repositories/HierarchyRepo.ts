import {
    BaseRepo, getAutomergeDocumentFromRedis, setAutomergeDocumentAtRedis
} from '@newturn-develop/molink-utils'
import {
    getHierarchyCacheKey,
    HierarchyChildrenOpenRepoName,
    HierarchyRepoName
} from '@newturn-develop/molink-constants'
import Automerge from 'automerge'
import {
    convertAutomergeDocumentToDBArray,
    convertDBArrayToAutomergeDocument
} from '@newturn-develop/molink-automerge-wrapper'
import CacheService from '../Services/CacheService'
import { HierarchyNotExists } from '../Errors/DocumentError'
import { HierarchyInfoInterface } from '@newturn-develop/types-molink'

class HierarchyRepo extends BaseRepo {
    async getHierarchy (userId: number) {
        // 캐싱되어있으면 Return
        const cache = await getAutomergeDocumentFromRedis<HierarchyInfoInterface>(CacheService.hierarchyRedis, getHierarchyCacheKey(userId))
        if (cache) {
            return cache
        }

        const rawHierarchy = await this._selectSingularDynamoByKey(
            HierarchyRepoName,
            'userId = :userId',
            {
                ':userId': userId
            })
        if (!rawHierarchy) {
            return undefined
        }
        const hierarchy = convertDBArrayToAutomergeDocument<HierarchyInfoInterface>(rawHierarchy.automergeValue)
        await setAutomergeDocumentAtRedis(CacheService.hierarchyRedis, getHierarchyCacheKey(userId), hierarchy)
        return hierarchy
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
