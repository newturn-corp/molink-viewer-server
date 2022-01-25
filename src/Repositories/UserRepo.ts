import User from '../Domains/User'
import { BaseRepo } from '@newturn-develop/molink-utils'

class UserRepo extends BaseRepo {
    getActiveUserById (id: number): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    getActiveUserByNickname (nickname: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE nickname = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [nickname])
    }
}

export default new UserRepo()
