import OpenSearch from '../utils/openSearch'

class ContentRepo {
    async getContentByDocumentId (documentId: string) {
        const rawDocuments = await OpenSearch.select('knowlink-content', {
            query: {
                match: {
                    documentId
                }
            },
            size: 1
        }) as any
        if (rawDocuments.length === 0) {
            return undefined
        }
        return rawDocuments[0]._source.content
    }

    async getContent (id: string) {
        const rawContent = await OpenSearch.get('knowlink-content', id) as any
        return rawContent.content
    }

    async saveContent (content: any) {
        const id = await OpenSearch.insert('knowlink-content', 'content', { content, createdAt: new Date(), updatedAt: new Date() }) as string
        return id
    }

    async updateContent (id: string, content: any) {
        await OpenSearch.update('knowlink-content', id, { content, updatedAt: new Date() })
    }

    async deleteContent (id: string) {
        await OpenSearch.delete('knowlink-content', id, 'content')
    }
}
export default new ContentRepo()
