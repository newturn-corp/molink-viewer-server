import { ESComment, ESPageSummary, ESUser, PageVisibility } from '@newturn-develop/types-molink'
import { OpenSearch } from '@newturn-develop/molink-utils'

class ESCommentRepo {
    rawSourceToComment (id: string, source: any) {
        return new ESComment(id, source.pageId, source.userId, source.content, source.parentCommentId, source.createdAt, source.deletedAt)
    }

    async getPageComments (pageId: string) {
        const { total, documents } = await OpenSearch.select('molink-page', {
            query: {
                term: {
                    pageId
                }
            }
        })
        return {
            total,
            documents: documents.map((raw: any) => {
                const { _id: id, _source: source } = raw
                return this.rawSourceToComment(id, source)
            }) as ESComment[]
        }
    }
}
export default new ESCommentRepo()
