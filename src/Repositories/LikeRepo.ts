import { BaseRepo } from '@newturn-develop/molink-utils'

class LikeRepo extends BaseRepo {
    checkActiveLikeExists (pageId: string, userId: number): Promise<boolean> {
        const queryString = 'SELECT * FROM LIKE_TB WHERE page_id = ? AND user_id = ? AND canceled_at IS NULL'
        return this._check(queryString, [pageId, userId])
    }
}

export default new LikeRepo()
