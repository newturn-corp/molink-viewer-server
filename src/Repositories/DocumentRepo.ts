import OpenSearch from '../utils/openSearch'

import Document from '../Domains/Document'

class DocumentRepo {
    rawSourceToDocument (id: string, source: any) {
        return new Document(id, source.userId, source.title, source.icon, source.order, source.isChildrenOpen, source.parentId, source.visibility, source.createdAt, source.updatedAt, source.contentId, source.representative, source.selection, source.isLocked)
    }

    async getDocument (id: string) {
        const raw = await OpenSearch.get('knowlink-document', id)
        if (!raw) {
            return undefined
        }
        return this.rawSourceToDocument(id, raw)
    }
}
export default new DocumentRepo()
