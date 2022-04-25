import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESPageSummary, PageVisibility } from '@newturn-develop/types-molink'

class ESUserRepo {
    rawSourceToPageSummary (id: string, source: any) {
        return new ESPageSummary(id, source.title, source.userId, source.image, source.description, source.lastEditedAt)
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
        const rawDocuments = await OpenSearch.select('molink-user', {
            sort: [
                {
                    lastEditedAt: {
                        order: 'desc'
                    }
                }
            ],
            _source: ['title', 'userId', 'image', 'description', 'lastEditedAt'],
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
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToPageSummary(id, source)
        }) as ESPageSummary[]
    }
}
export default new ESUserRepo()
