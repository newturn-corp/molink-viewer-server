import PasswordChange from '../Domains/PasswordChange'
import { BaseRepo } from '@newturn-develop/molink-utils'

class EmailAuthRepo extends BaseRepo {
    savePasswordChange (userId: number, ip: string, hashKey: string): Promise<number> {
        const queryString = 'INSERT INTO PASSWORD_CHANGE_TB(user_id, ip, hash_key) VALUES(?, ?, ?)'
        return this._insert(queryString, [userId, ip, hashKey])
    }

    getActivePasswordChangesByIP (ip: string, standard: Date): Promise<PasswordChange[]> {
        const queryString = 'SELECT * FROM PASSWORD_CHANGE_TB WHERE ip = ? AND created_at > ?'
        return this._selectPlural(queryString, [ip, standard])
    }

    getActivePasswordChangesByID (userId: number, standard: Date): Promise<PasswordChange[]> {
        const queryString = 'SELECT * FROM PASSWORD_CHANGE_TB WHERE user_id = ? AND created_at > ?'
        return this._selectPlural(queryString, [userId, standard])
    }

    setExpiredByUserId (userId: number) {
        const queryString = 'UPDATE PASSWORD_CHANGE_TB SET is_expired = 1 WHERE user_id = ? AND is_expired = 0'
        return this._update(queryString, [userId])
    }

    getPasswordChangeByHashkey (hashKey: string, standard: Date): Promise<PasswordChange> {
        const queryString = 'SELECT * FROM PASSWORD_CHANGE_TB WHERE hash_key = ? AND created_at > ?'
        return this._selectSingular(queryString, [hashKey, standard])
    }

    setSucceeded (id: number) {
        const queryString = 'UPDATE PASSWORD_CHANGE_TB SET is_succeeded = 1 WHERE id = ?'
        return this._update(queryString, [id])
    }
}

export default new EmailAuthRepo()
