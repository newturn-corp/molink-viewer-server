export default class Follow {
    id: number
    user_id: number
    follower_id: number
    created_at: Date
    updated_at: Date

    constructor (id: number, user_id: number, follower_id: number, created_at: Date, updated_at: Date) {
        this.id = id
        this.user_id = user_id
        this.follower_id = follower_id
        this.created_at = created_at
        this.updated_at = updated_at
    }
}
