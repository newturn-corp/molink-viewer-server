import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESBlog } from '@newturn-develop/types-molink'

class ESBlogRepo {
    rawSourceToESBlog (id: string, source: any) {
        return new ESBlog(id, source.name, source.profileImageURL, source.biography, source.followerCount)
    }

    async getBlogs (blogIDList: number[]): Promise<ESBlog[]> {
        const documents = await OpenSearch.select(
            'molink-blog',
            {
                query: {
                    ids: {
                        values: blogIDList.map(v => v.toString())
                    }
                }
            }
        )
        return documents.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToESBlog(id, source)
        })
    }
}
export default new ESBlogRepo()
