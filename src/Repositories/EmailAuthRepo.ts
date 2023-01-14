import EmailAuth from '../Domains/EmailAuth'
import { BaseRepo } from '@newturn-develop/molink-utils'

class EmailAuthRepo extends BaseRepo {
    saveEmailAuth (userId: number, ip: string, hashKey: string): Promise<number> {
        const queryString = 'INSERT INTO EMAIL_AUTH_TB(user_id, ip, hash_key) VALUES(?, ?, ?)'
        return this._insert(queryString, [userId, ip, hashKey])
    }

    getEmailAuthByHashkey (hashKey: string, standard: Date): Promise<EmailAuth> {
        const queryString = 'SELECT * FROM EMAIL_AUTH_TB WHERE is_succeeded = 0 AND hash_key = ? AND created_at > ?'
        return this._selectSingular(queryString, [hashKey, standard])
    }

    getEmailAuthListByUserId (userId: number, standard: Date): Promise<EmailAuth[]> {
        const queryString = 'SELECT * FROM EMAIL_AUTH_TB WHERE user_id = ? AND created_at > ?'
        return this._selectPlural(queryString, [userId, standard])
    }

    getActiveEmailAuthListByIP (ip: string, standard: Date): Promise<EmailAuth[]> {
        const queryString = 'SELECT * FROM EMAIL_AUTH_TB WHERE ip = ? AND created_at > ?'
        return this._selectPlural(queryString, [ip, standard])
    }

    setExpiredByUserId (userId: number) {
        const queryString = 'UPDATE EMAIL_AUTH_TB SET is_expired = 1 WHERE user_id = ? AND is_expired = 0'
        return this._update(queryString, [userId])
    }

    setSucceeded (id: number) {
        const queryString = 'UPDATE EMAIL_AUTH_TB SET is_succeeded = 1 WHERE id = ?'
        return this._update(queryString, [id])
    }
}

export default new EmailAuthRepo()
