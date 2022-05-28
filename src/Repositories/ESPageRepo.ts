import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESPageSummary, ESUser, PageVisibility, ESPageSummaryWithVisibility } from '@newturn-develop/types-molink'

class ESUserRepo {
    rawSourceToPageSummary (id: string, source: any) {
        return new ESPageSummary(id, source.title, source.userId, source.image, source.description, source.lastEditedAt, source.like)
    }

    rawSourceToPageSummaryWithVisibility (id: string, source: any) {
        return new ESPageSummaryWithVisibility(id, source.title, source.userId, source.image, source.description, source.lastEditedAt, source.like, source.visibility)
    }

    getVisibilityToNumber (visibility: PageVisibility) {
        switch (visibility) {
        case PageVisibility.Public:
            return 2
        case PageVisibility.OnlyFollower:
            return 1
        case PageVisibility.Private:
            return 0
        }
    }

    async getUserPageSummaryList (userId: number, maxVisibility: PageVisibility, size: number = 5, from: number = 0) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
            sort: [
                {
                    lastEditedAt: {
                        order: 'desc'
                    }
                }
            ],
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like'],
            from,
            size,
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                userId
                            }
                        },
                        {
                            range: {
                                visibility: {
                                    gte: this.getVisibilityToNumber(maxVisibility)
                                }
                            }
                        }
                    ]
                }
            }
        })
        return {
            total,
            documents: documents.map((raw: any) => {
                const { _id: id, _source: source } = raw
                return this.rawSourceToPageSummary(id, source)
            }) as ESPageSummary[]
        }
    }

    async getFollowPageList (followerList: number[], size: number = 5, from: number = 0) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
            sort: [
                {
                    lastEditedAt: {
                        order: 'desc'
                    }
                }
            ],
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like'],
            from,
            size,
            query: {
                bool: {
                    must: [
                        {
                            terms: {
                                userId: followerList
                            }
                        },
                        {
                            range: {
                                visibility: {
                                    gte: this.getVisibilityToNumber(PageVisibility.OnlyFollower)
                                }
                            }
                        }
                    ]
                }
            }
        })
        return {
            total,
            documents: documents.map((raw: any) => {
                const { _id: id, _source: source } = raw
                return this.rawSourceToPageSummary(id, source)
            }) as ESPageSummary[]
        }
    }

    // TODO: get은 Page 전체를 가져오므로 field를 필터링해야할 필요가 있음
    async getPageSummaryWithVisibility (pageID: string) {
        const source = await OpenSearch.get('molink-page', pageID)
        return this.rawSourceToPageSummaryWithVisibility(pageID, source)
    }

    async getPageSummaryListByIDList (idList: string[]) {
        const rawDocuments = await OpenSearch.select('molink-page', {
            query: {
                ids: {
                    values: idList.map(id => id.toString())
                }
            }
        })
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToPageSummary(id, source)
        }) as ESPageSummary[]
    }
}
export default new ESUserRepo()
