import OpenSearch from '../utils/openSearch'

import Document from '../Domains/Document'
import BaseRepo from './BaseRepo'
import env from '../env'
import DocumentChildrenOpen from '../Domains/DocumentChildrenOpen'

class DocumentRepo extends BaseRepo {
    rawSourceToDocument (id: string, source: any) {
        return new Document(id, source.userId, source.title, source.icon, source.visibility, source.parentId, source.order, source.location, source.createdAt, source.updatedAt, source.contentId, source.editionInfoId)
    }

    async getDocument (id: string) {
        const raw = await OpenSearch.get('knowlink-document', id)
        if (!raw) {
            return undefined
        }
        return this.rawSourceToDocument(id, raw)
    }

    async getDocumentsByUserId (userId: number) {
        const rawDocuments = await OpenSearch.select('knowlink-document', {
            query: {
                term: { userId }
            },
            size: 2000
        }) as any
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToDocument(id, source)
        }) as Document[]
    }

    async getDocumentChildrenOpenListByUserIdAndViewerId (userId: number, viewerId: number): Promise<DocumentChildrenOpen[]> {
        const tableName = `molink-document-children-open-${env.isProduction ? 'production' : 'development'}-table`
        const conditionString = 'itemKey = :itemKey'
        const args = {
            ':itemKey': `${userId}-${viewerId}`
        }
        const items = await this._selectItemsByKey(tableName, conditionString, args)
        return items as DocumentChildrenOpen[]
    }
}
export default new DocumentRepo()
