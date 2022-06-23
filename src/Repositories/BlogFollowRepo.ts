import { BaseRepo } from '@newturn-develop/molink-utils'
import { BlogFollow } from '@newturn-develop/types-molink'

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

    async getUserBlogFollows (userID: number): Promise<BlogFollow[]> {
        const queryString = 'SELECT * FROM BLOG_FOLLOW_TB WHERE user_id = ?'
        return this._selectPlural(queryString, [userID])
    }
}

export default new BlogFollowRepo()
