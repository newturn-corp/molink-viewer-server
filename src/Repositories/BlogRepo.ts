import { BaseRepo } from '@newturn-develop/molink-utils'
import { Blog } from '@newturn-develop/types-molink'

class BlogRepo extends BaseRepo {
    getBlog (id: number): Promise<Blog | undefined> {
        const queryString = 'SELECT * FROM BLOG_TB WHERE id = ? AND is_deleted = 0'
        return this._selectSingular(queryString, [id])
    }

    getBlogs (idList: number[]): Promise<Blog[]> {
        const queryString = 'SELECT * FROM BLOG_TB WHERE id IN (?)'
        return this._selectPlural(queryString, [idList])
    }

    getBlogsByNameList (nameList: string[]): Promise<Blog[]> {
        const queryString = 'SELECT * FROM BLOG_TB WHERE blog_name IN (?)'
        return this._selectPlural(queryString, [nameList])
    }

    getBlogsByUserID (userID: number): Promise<Blog[]> {
        const queryString = 'SELECT * FROM (SELECT blog_id FROM BLOG_USER_TB WHERE user_id = ?) A, BLOG_TB WHERE BLOG_TB.id = A.blog_id'
        return this._selectPlural(queryString, [userID])
    }

    getPublicBlogsByUserID (userID: number): Promise<Blog[]> {
        const queryString = 'SELECT * FROM (SELECT blog_id FROM BLOG_USER_TB WHERE user_id = ?) A, (SELECT * FROM BLOG_TB WHERE is_private = 0) B WHERE B.id = A.blog_id'
        return this._selectPlural(queryString, [userID])
    }
}

export default new BlogRepo()
