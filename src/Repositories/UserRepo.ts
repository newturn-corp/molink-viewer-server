import User from '../Domains/User'
import { UserWithProfileDTO } from '../DTO/UserDTO'
import { DateUtil } from '../utils/DateUtil'
import BaseRepo from './BaseRepo'

class UserRepo extends BaseRepo {
    getActiveUserByEmail (email: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE email = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [email])
    }

    getActiveUserById (id: number): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    saveUser (email: string, nickname: string, pwd: string, pwdSalt: string): Promise<number> {
        const queryString = 'INSERT INTO USER_TB(email, nickname, pwd, pwd_salt) VALUES(?, ?, ?, ?)'
        return this._insert(queryString, [email, nickname, pwd, pwdSalt])
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

    getActiveUserByNickname (nickname: string): Promise<User | undefined> {
        const queryString = 'SELECT * FROM USER_TB WHERE nickname = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [nickname])
    }

    searchUserByNicknameWithProfile (nickname: string): Promise<UserWithProfileDTO[]> {
        const queryString = 'SELECT * FROM (SELECT * FROM USER_TB WHERE nickname LIKE ? AND is_deleted = 0) A LEFT JOIN USER_PROFILE_TB ON id = user_id'
        return this._selectPlural(queryString, [`%${nickname}%`])
    }

    getUserWithProfile (id: number): Promise<UserWithProfileDTO> {
        const queryString = 'SELECT * FROM (SELECT * FROM USER_TB WHERE id = ? AND is_deleted = 0) A LEFT JOIN USER_PROFILE_TB ON id = user_id'
        return this._selectSingular(queryString, [id])
    }

    getUsersWithProfile (userIdList: number[]): Promise<UserWithProfileDTO[]> {
        const queryString = 'SELECT * FROM (SELECT * FROM USER_TB WHERE id IN (?) AND is_deleted = 0) A LEFT JOIN USER_PROFILE_TB ON id = user_id'
        console.log(userIdList)
        return this._selectPlural(queryString, [userIdList])
    }

    setUserRepresentativeDocumentId (id: number, representativeDocumentId: string | null) {
        const queryString = 'UPDATE USER_TB SET representative_document_id = ? WHERE id = ?'
        return this._update(queryString, [representativeDocumentId, id])
    }
}

export default new UserRepo()
