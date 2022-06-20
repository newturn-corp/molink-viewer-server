import { BaseRepo } from '@newturn-develop/molink-utils'

class BlogFollowRepo extends BaseRepo {
    checkUserFollowBlog (blogID: number, userId: number): Promise<boolean> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_TB WHERE user_id = ? AND blog_id = ?'
        return this._check(queryString, [userId, blogID])
    }

    async getBlogFollowerCount (blogID: number) {
        const queryString = 'SELECT COUNT(id) AS count FROM BLOG_FOLLOW_TB WHERE blog_id = ?'
        const result = await this._selectSingular(queryString, [blogID])
        return result.count
    }
}

export default new BlogFollowRepo()
