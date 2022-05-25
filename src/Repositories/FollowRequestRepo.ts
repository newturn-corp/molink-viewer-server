import { BaseRepo } from '@newturn-develop/molink-utils'
import { FollowRequest } from '@newturn-develop/types-molink'

class FollowRequestRepo extends BaseRepo {
    checkActiveFollowRequest (userId: number, targetUserId: number): Promise<FollowRequest[]> {
        const queryString = 'SELECT * FROM FOLLOW_REQUEST_TB WHERE user_id = ? AND follower_id = ? AND rejected_at IS NULL AND accepted_at IS NULL'
        return this._check(queryString, [targetUserId, userId])
    }
}

export default new FollowRequestRepo()
