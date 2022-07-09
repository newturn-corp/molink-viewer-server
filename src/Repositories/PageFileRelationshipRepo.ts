import { BaseRepo } from '@newturn-develop/molink-utils'

class PageFileRelationshipRepo extends BaseRepo {
    savePageFileRelationship (pageId: string, fileHandle: string, fileCount: number): Promise<number> {
        const queryString = 'INSERT INTO PAGE_FILE_RELATIONSHIP_TB(page_id, file_handle, file_count) VALUES(?, ?, ?)'
        return this._insert(queryString, [pageId, fileHandle, fileCount])
    }

    getPageFileRelationship (pageId: string, fileHandle: string) {
        const queryString = 'SELECT * FROM PAGE_FILE_RELATIONSHIP_TB WHERE page_id = ? AND file_handle = ?'
        return this._selectSingular(queryString, [pageId, fileHandle])
    }

    setPageFileRelationshipFileCount (pageId: string, fileHandle: string, fileCount: number) {
        const queryString = 'UPDATE PAGE_FILE_RELATIONSHIP_TB SET file_count = ? WHERE page_id = ? AND file_handle = ?'
        return this._update(queryString, [fileCount, pageId, fileHandle])
    }

    deletePageFileRelationship (pageId: string, fileHandle: string) {
        const queryString = 'DELETE FROM PAGE_FILE_RELATIONSHIP_TB WHERE page_id = ? AND file_handle = ?'
        return this._delete(queryString, [pageId, fileHandle])
    }
}

export default new PageFileRelationshipRepo()
