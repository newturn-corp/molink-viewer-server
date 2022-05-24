export default class User {
    id: number
    nickname: string
    pwd: string
    pwd_salt: string
    email: string
    is_email_auth: boolean
    email_auth_at: Date
    login_attempt_count: number
    representative_document_id: string | null

    constructor (id: number, nickname: string, pwd: string, pwd_salt: string, email: string, is_email_auth: boolean, email_auth_at: Date, login_attempt_count: number, representative_document_id: string | null) {
        this.id = id
        this.nickname = nickname
        this.pwd = pwd
        this.pwd_salt = pwd_salt
        this.email = email
        this.is_email_auth = is_email_auth
        this.email_auth_at = email_auth_at
        this.login_attempt_count = login_attempt_count
        this.representative_document_id = representative_document_id
    }
}
