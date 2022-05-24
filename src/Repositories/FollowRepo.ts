import Follow from '../Domains/Follow'
import { BaseRepo } from '@newturn-develop/molink-utils'

class FollowerRepo extends BaseRepo {
    getUserFollowers (userId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM FOLLOW_TB WHERE user_id = ?'
        return this._selectPlural(queryString, [userId])
    }

    getFollowerFollows (userId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM FOLLOW_TB WHERE following_user_id = ?'
        return this._selectPlural(queryString, [userId])
    }

    getUserFollowCount (userId: number): Promise<{ count: number }> {
        const queryString = 'SELECT COUNT(*) as count FROM FOLLOW_TB WHERE user_id = ?'
        return this._selectSingular(queryString, [userId])
    }

    getUserFollowingCount (userId: number): Promise<{ count: number }> {
        const queryString = 'SELECT COUNT(*) as count FROM FOLLOW_TB WHERE following_user_id = ?'
        return this._selectSingular(queryString, [userId])
    }
}

export default new FollowerRepo()
