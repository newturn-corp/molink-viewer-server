import { OpenSearch } from '@newturn-develop/molink-utils'

class BlogViewLogRepo {
    async saveBlogViewLog (blogID: number, viewerID: number | null, ip: string | string[] | undefined, userAgent: any) {
        await OpenSearch.insert(
            'molink-blog-view-log',
            'view-log', {
                blogID,
                viewerID,
                userAgent,
                ip,
                createdAt: new Date()
            })
    }
}
export default new BlogViewLogRepo()
