import { OpenSearch } from '@newturn-develop/molink-utils'
import {
    ESPageSummary,
    ESUser,
    PageVisibility,
    ESPageSummaryWithVisibility,
    ESPageMetaInfo, ESEditorPageInfo, ESPageSearchResult
} from '@newturn-develop/types-molink'

const summaryFields = ['title', 'userId', 'image', 'description', 'lastEditedAt', 'like', 'commentCount', 'lastPublishedAt', 'blogID']

class ESUserRepo {
    rawSourceToPageSummary (id: string, source: any) {
        return new ESPageSummary(id, source.title, source.blogID, source.image, source.description, source.lastEditedAt, source.lastPublishedAt, source.like, source.commentCount)
    }

    rawSourceToPageSummaryWithVisibility (id: string, source: any) {
        return new ESPageSummaryWithVisibility(id, source.title, source.blogID, source.image, source.description, source.lastEditedAt, source.lastPublishedAt, source.like, source.commentCount, source.visibility)
    }

    rawSourceToPageMetaInfo (id: string, source: any) {
        return new ESPageMetaInfo(source.title, source.userId, source.blogID, source.image, source.description, source.lastEditedAt, source.lastPublishedAt, source.tags, source.visibility, source.icon)
    }

    rawSourceToEditorPageInfo (id: string, source: any) {
        return new ESEditorPageInfo(source.lastEditedAt, source.lastPublishedAt, source.like, source.tags)
    }

    rawSourceToPageSearchResult (id: string, source: any, highlight: any) {
        const title = highlight?.title ? highlight.title[0] : source.title
        const content = highlight?.content ? highlight.content[0] : source.description
        return new ESPageSearchResult(id, title, source.blogID, source.image, content, source.tags, source.lastEditedAt, source.lastPublishedAt)
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

    async getPageIDList () {
        const documents = await OpenSearch.select('molink-page', {
            query: {
                match_all: {}
            },
            stored_fields: [],
            size: 10000
        })
        return documents.map((raw: any) => raw._id)
    }

    async getBlogPageSummaryList (blogID: number, maxVisibility: PageVisibility, size: number = 5, from: number = 0) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
            sort: [
                {
                    lastEditedAt: {
                        order: 'desc'
                    }
                }
            ],
            _source: summaryFields,
            from,
            size,
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                blogID
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
            _source: summaryFields,
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

    async getPageSummaryWithVisibility (pageID: string): Promise<ESPageSummaryWithVisibility> {
        const source = await OpenSearch.get('molink-page', pageID, {
            includeFields: [...summaryFields, 'visibility']
        })
        return source && this.rawSourceToPageSummaryWithVisibility(pageID, source)
    }

    async getPageMetaInfo (pageID: string): Promise<ESPageMetaInfo> {
        const source = await OpenSearch.get('molink-page', pageID, {
            includeFields: ['title', 'userId', 'image', 'description', 'lastEditedAt', 'lastPublishedAt', 'tags', 'visibility', 'blogID', 'icon']
        })
        return source && this.rawSourceToPageMetaInfo(pageID, source)
    }

    async getEditorPageInfo (pageID: string): Promise<ESPageMetaInfo> {
        const source = await OpenSearch.get('molink-page', pageID, {
            includeFields: ['lastEditedAt', 'lastPublishedAt', 'tags', 'like']
        })
        return source && this.rawSourceToEditorPageInfo(pageID, source)
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
            _source: summaryFields,
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

    async getUserPageSummaryList (userId: number, maxVisibility: PageVisibility, size: number = 5, from: number = 0) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
            sort: [
                {
                    lastEditedAt: {
                        order: 'desc'
                    }
                }
            ],
            _source: summaryFields,
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
                                    gte: maxVisibility
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

    async getPageRawContent (pageID: string) {
        const source = await OpenSearch.get('molink-page', pageID, {
            includeFields: ['rawContent']
        })
        return source && source.rawContent
    }

    async searchByText (text: string, from: number, size: number) {
        const { total, documents } = await OpenSearch.selectWithTotal('molink-page', {
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
                            multi_match: {
                                query: text,
                                fields: ['title^4', 'tags.keyword^4', 'content']
                            }
                        }
                    ]
                }
            },
            highlight: {
                fields: {
                    content: {
                        fragment_size: 200
                    },
                    title: {}
                }
            },
            from,
            size,
            _source: ['title', 'image', 'lastEditedAt', 'userId', 'tags', 'lastPublishedAt', 'description', 'blogID']
        })
        return {
            total,
            documents: documents.map((raw: any) => {
                const { _id: id, _source: source, highlight } = raw
                return this.rawSourceToPageSearchResult(id, source, highlight)
            })
        }
    }
}
export default new ESUserRepo()
