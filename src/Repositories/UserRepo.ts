import { BaseRepo, OpenSearch, DateUtil } from '@newturn-develop/molink-utils'
import { User } from '@newturn-develop/types-molink'

class UserRepo extends BaseRepo {
    getActiveUserById (id: number): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    getActiveUserByNickname (nickname: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE nickname = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [nickname])
    }

    getActiveUserByEmail (email: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE email = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [email])
    }

    saveUser (email: string, nickname: string, pwd: string, pwdSalt: string, isAcceptMarketing: boolean): Promise<number> {
        const queryString = 'INSERT INTO USER_TB(email, nickname, pwd, pwd_salt, is_accept_marketing) VALUES(?, ?, ?, ?, ?)'
        return this._insert(queryString, [email, nickname, pwd, pwdSalt, Number(isAcceptMarketing)])
    }

    setUserLogin (id: number, at: Date) {
        const queryString = `
        UPDATE USER_TB
        SET login_attempt_count = 0, login_at = ?, is_login = 1
        WHERE id = ? AND is_deleted = 0`
        return this._update(queryString, [at, id])
    }

    setUserJwt (id: number, jwt: string) {
        const queryString = 'UPDATE USER_TB SET jwt = ? WHERE id = ?'
        return this._update(queryString, [jwt, id])
    }

    setUserLoginAttemptCount (id: number, loginAttemptCount: number) {
        const queryString = 'UPDATE USER_TB SET login_attempt_count = ? WHERE id = ?'
        return this._update(queryString, [loginAttemptCount, id])
    }

    setUserEmailAuth (id: number) {
        const queryString = 'UPDATE USER_TB SET is_email_auth = 1, email_auth_at = ? WHERE id = ?'
        return this._update(queryString, [DateUtil.now(), id])
    }

    setUserPwdAndSalt (id: number, pwd: string, salt: string) {
        const queryString = 'UPDATE USER_TB SET pwd = ?, pwd_salt = ? WHERE id = ?'
        return this._update(queryString, [pwd, salt, id])
    }
}

export default new UserRepo()
