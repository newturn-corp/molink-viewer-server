import OpenSearch from '../utils/openSearch'

import Document from '../Domains/Document'
import BaseRepo from './BaseRepo'
import env from '../env'
import DocumentChildrenOpen from '../Domains/DocumentChildrenOpen'
import DocumentHierarchyInfo from '../Domains/DocumentFilesystemInfo'

class DocumentRepo extends BaseRepo {
    rawSourceToDocument (id: string, source: any) {
        return new Document(id, source.userId, source.title, source.icon, source.visibility, source.createdAt, source.updatedAt, source.contentId, source.editionInfoId, source.hierarchyInfoId)
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

    async getDocumentHierarchyInfoListByUserId (userId: number): Promise<DocumentHierarchyInfo[]> {
        const tableName = env.isProduction ? 'production' : 'development'
        const conditionString = 'userId = :userId'
        const args = {
            ':userId': userId
        }
        const items = await this._selectItemsByKey(`knowlink-document-hierarchy-info-${tableName}-table`, conditionString, args)
        return items as DocumentHierarchyInfo[]
    }

    async getDocumentHierarchyInfoListByID (id: string): Promise<DocumentHierarchyInfo | undefined> {
        const tableName = env.isProduction ? 'production' : 'development'
        const conditionString = 'id = :id'
        const args = {
            ':id': id
        }
        const items = await this._selectItemsByKey(`knowlink-document-hierarchy-info-${tableName}-table`, conditionString, args)
        if (!items) {
            return undefined
        }
        return items[0] as DocumentHierarchyInfo
    }

    async getDocumentChildrenOpen (documentId: string, viewerId: number): Promise<DocumentChildrenOpen | undefined> {
        const tableName = `knowlink-document-children-open-${env.isProduction ? 'production' : 'development'}-table`
        const conditionString = 'documentId = :documentId AND viewerId = :viewerId AND open = true'
        const args = {
            ':documentId': documentId,
            ':viewerId': viewerId
        }
        const items = await this._selectItemsByKey(tableName, conditionString, args)
        if (!items) {
            return undefined
        }
        return items[0] as DocumentChildrenOpen
    }

    async getDocumentChildrenOpenListByUserIdAndViewerId (userId: number, viewerId: number): Promise<DocumentChildrenOpen[]> {
        const tableName = `knowlink-document-children-open-${env.isProduction ? 'production' : 'development'}-table`
        const conditionString = 'userId = :userId AND viewerId = :viewerId AND open = true'
        const args = {
            ':userId': userId,
            ':viewerId': viewerId
        }
        const items = await this._selectItemsByKey(tableName, conditionString, args)
        return items as DocumentChildrenOpen[]
    }
}
export default new DocumentRepo()
