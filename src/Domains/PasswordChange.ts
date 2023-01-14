export default class PasswordChange {
    id: number
    user_id: number
    ip: string
    hash_key: string
    is_succeeded: number
    is_expired: number
    created_at: Date

    constructor (id: number, user_id: number, ip: string, hash_key: string, is_succeeded: number, is_expired: number, created_at: Date) {
        this.id = id
        this.user_id = user_id
        this.ip = ip
        this.hash_key = hash_key
        this.is_succeeded = is_succeeded
        this.is_expired = is_expired
        this.created_at = created_at
    }
}
