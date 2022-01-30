import { BaseRepo, getAutomergeDocumentFromRedis, setAutomergeDocumentAtRedis } from '@newturn-develop/molink-utils'
import { ContentRepoName } from '@newturn-develop/molink-constants'
import { convertDBArrayToAutomergeDocument } from '@newturn-develop/molink-automerge-wrapper'
import CacheService from '../Services/CacheService'

class ContentRepo extends BaseRepo {
    async getContent (documentId: string) {
        const cache = await getAutomergeDocumentFromRedis(CacheService.contentRedis, documentId)
        if (cache) {
            return cache
        }

        const rawContent = await this._selectSingularDynamoByKey(
            ContentRepoName,
            'documentId = :documentId',
            {
                ':documentId': documentId
            })
        if (!rawContent) {
            return undefined
        }
        const content = convertDBArrayToAutomergeDocument(rawContent.automergeValue)
        await setAutomergeDocumentAtRedis(CacheService.hierarchyRedis, documentId, content)
        return content
    }
}
export default new ContentRepo()
