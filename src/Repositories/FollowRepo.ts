import Follow from '../domain/Follow'
import BaseRepo from './BaseRepo'

class FollowerRepo extends BaseRepo {
    getUserFollowers (userId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM FOLLOW_TB WHERE user_id = ?'
        return this._selectPlural(queryString, [userId])
    }

    getUserFollowings (userId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM FOLLOW_TB WHERE following_user_id = ?'
        return this._selectPlural(queryString, [userId])
    }

    saveFollow (userId: number, followerId: number) {
        const queryString = 'INSERT INTO FOLLOW_TB(user_id, following_user_id) VALUES(?, ?)'
        return this._insert(queryString, [userId, followerId])
    }

    checkFollowByUserIdAndFollowerId (userId: number, followerId: number): Promise<Follow[]> {
        const queryString = 'SELECT * FROM FOLLOW_TB WHERE user_id = ? AND following_user_id = ?'
        return this._check(queryString, [userId, followerId])
    }
}

export default new FollowerRepo()
