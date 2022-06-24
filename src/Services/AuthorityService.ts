import ContentRepo from '../Repositories/ContentRepo'
import FollowerRepo from '../Repositories/FollowRepo'
import {
    BlogAuthority,
    HierarchyDocumentInfoInterface,
    PageAuthority,
    PageVisibility,
    User
} from '@newturn-develop/types-molink'
import { PageNotExist } from '../Errors/DocumentError'
import CacheService from './CacheService'
import { Slack } from '@newturn-develop/molink-utils'
import env from '../env'
import BlogFollowRepo from '../Repositories/BlogFollowRepo'
import { BlogNotExists } from '../Errors/BlogError'
import BlogRepo from '../Repositories/BlogRepo'
import BlogUserRepo from '../Repositories/BlogUserRepo'
import LiveBlogRepo from '../Repositories/LiveBlogRepo'

class AuthorityService {
    checkUserFollowBlog (blogID: number, userID: number) {
        return BlogFollowRepo.checkUserFollowBlog(blogID, userID)
    }

    async getPageInfo (pageId: string): Promise<HierarchyDocumentInfoInterface> {
        try {
            const rawPage = await CacheService.hierarchy.get(`page-${pageId}`)
            if (rawPage) {
                return JSON.parse(rawPage)
            }
        } catch (err) {
            await Slack.sendTextMessage('Redis Error In Viewer Server', env.isProduction ? 'C02SE9VA8TC' : 'C02TWKQHJ64')
        }
        const content = await ContentRepo.getContent(pageId)
        if (!content) {
            throw new PageNotExist()
        }
        const info = content.getMap('info')
        const pageBlogID = info.get('blogID') as number

        const hierarchyPageInfo = await LiveBlogRepo.getBlogPageInfo(pageBlogID, pageId)
        if (!hierarchyPageInfo) {
            throw new PageNotExist()
        }
        try {
            await CacheService.hierarchy.setWithEx(`page-${pageId}`, JSON.stringify(hierarchyPageInfo), 1800)
        } catch (err) {
            await Slack.sendTextMessage('Redis Error In Viewer Server', env.isProduction ? 'C02SE9VA8TC' : 'C02TWKQHJ64')
        }
        return hierarchyPageInfo
    }

    async getPageAuthorityByPageId (viewer: User, pageId: string) {
        const hierarchyPageInfo = await this.getPageInfo(pageId)
        const blog = hierarchyPageInfo.blogID && await BlogRepo.getBlog(hierarchyPageInfo.blogID)

        if (blog) {
            const blogUser = viewer && await BlogUserRepo.getBlogUser(blog.id, viewer.id)
            if (blog.is_private) {
                if (blogUser) {
                    return new PageAuthority(true, true)
                } else {
                    return new PageAuthority(false, false)
                }
            } else {
                if (hierarchyPageInfo.visibility === PageVisibility.Public) {
                    return new PageAuthority(!!blogUser, true)
                }
                if (!viewer) {
                    return new PageAuthority(false, false)
                }
                if (blogUser) {
                    return new PageAuthority(true, true)
                }
                if (hierarchyPageInfo.visibility === PageVisibility.OnlyFollower) {
                    const isFollower = await BlogFollowRepo.checkUserFollowBlog(blog.id, viewer.id)
                    if (isFollower) {
                        return new PageAuthority(!!blogUser, true)
                    } else {
                        return new PageAuthority(false, false)
                    }
                }
                // private 인 경우
                return new PageAuthority(false, false)
            }
        }
    }

    async getBlogAuthority (viewer: User, blogID: number) {
        const blog = await BlogRepo.getBlog(blogID)
        if (!blog) {
            throw new BlogNotExists()
        }
        const blogUser = viewer && await BlogUserRepo.getBlogUser(blogID, viewer.id)
        if (blogUser) {
            return new BlogAuthority(true, true, !!blogUser.authority_set_profile, !!blogUser.authority_handle_follow)
        }
        return new BlogAuthority(!!blog.is_private, false, false, false)
    }
}
export default new AuthorityService()
