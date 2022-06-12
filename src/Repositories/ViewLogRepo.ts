import { OpenSearch } from '@newturn-develop/molink-utils'

class ViewLogRepo {
    async saveViewLog (pageID: string, pageUserID: number, viewerID: number | null, ip: string | string[] | undefined, userAgent: any) {
        await OpenSearch.insert(
            'molink-page-view-log',
            'view-log', {
                pageUserID,
                viewerID,
                pageID,
                userAgent,
                ip,
                createdAt: new Date()
            })
    }
}
export default new ViewLogRepo()
