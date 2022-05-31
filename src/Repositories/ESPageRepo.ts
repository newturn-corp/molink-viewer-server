import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESPageSummary, ESUser, PageVisibility, ESPageSummaryWithVisibility } from '@newturn-develop/types-molink'

class ESUserRepo {
    rawSourceToPageSummary (id: string, source: any) {
        return new ESPageSummary(id, source.title, source.userId, source.image, source.description, source.lastEditedAt, source.like, source.commentCount, source.lastPublishedAt)
    }

    rawSourceToPageSummaryWithVisibility (id: string, source: any) {
        return new ESPageSummaryWithVisibility(id, source.title, source.userId, source.image, source.description, source.lastEditedAt, source.like, source.commentCount, source.lastPublishedAt, source.visibility)
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
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like', 'commentCount', 'lastPublishedAt'],
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
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like', 'commentCount', 'lastPublishedAt'],
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

    async getPopularPageList (size: number = 5, from: number = 0) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
            sort: [
                {
                    _script: {
                        type: 'number',
                        script: {
                            lang: 'painless',
                            source: "(500.0 + 200.0 * doc['like'].value) / ((params.now - doc['lastPublishedAt'].value) / 86400000.0 + 15.0)",
                            params: {
                                now: Number(new Date())
                            }
                        },
                        order: 'desc'
                    }
                }
            ],
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like', 'commentCount', 'lastPublishedAt'],
            from,
            size,
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                visibility: {
                                    value: 2
                                }
                            }
                        },
                        {
                            exists: {
                                field: 'lastPublishedAt'
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
}
export default new ESUserRepo()
