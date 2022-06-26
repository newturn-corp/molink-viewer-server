import {
    GetHierarcyResponseDTO,
    HierarchyDocumentInfoInterface,
    PageVisibility,
    GetBlogNameResponseDTO,
    User,
    GetUserInfoByUserMapResponseDTO,
    BlogInfo,
    GetBlogInfoMapByBlogIDListResponseDTO,
    GetBlogFollowerCountDTO,
    Blog
} from '@newturn-develop/types-molink'
import AuthorityService from './AuthorityService'
import * as Y from 'yjs'
import LiveBlogRepo from '../Repositories/LiveBlogRepo'
import { BlogNotExists, UnauthorizedForBlog } from '../Errors/BlogError'
import BlogUserRepo from '../Repositories/BlogUserRepo'
import BlogRepo from '../Repositories/BlogRepo'
import { TooManyUserRequestError } from '../Errors/UserError'
import ESUserRepo from '../Repositories/ESUserRepo'
import { ViewerAPI } from '../API/ViewerAPI'
import BlogFollowRepo from '../Repositories/BlogFollowRepo'

export class BlogService {
    viewerAPI: ViewerAPI

    constructor (viewerAPI: ViewerAPI) {
        this.viewerAPI = viewerAPI
    }

    async getMaxAvailVisibility (blogID: number, viewer: User | null) {
        if (!viewer) {
            return PageVisibility.Public
        }

        // 해당 블로그의 사용자일 경우, 비공개 문서까지 전부 볼 수 있다.
        const blogUser = await BlogUserRepo.getBlogUser(blogID, viewer.id)
        if (blogUser) {
            return PageVisibility.Private
        }

        const isFollower = viewer && await AuthorityService.checkUserFollowBlog(blogID, viewer.id)
        if (isFollower) {
            return PageVisibility.OnlyFollower
        } else {
            return PageVisibility.Public
        }
    }

    private async _filterBlog (blog: Y.Doc, blogID: number, viewer: User): Promise<Y.Doc> {
        const maxVisibility = await this.getMaxAvailVisibility(blogID, viewer)
        blog.transact(() => {
            const map = blog.getMap<HierarchyDocumentInfoInterface>('pageInfoMap')
            const topLevelPageIDList = blog.getArray('topLevelPageIDList')
            const newTopLevelPageIDList = []
            for (const page of map.values()) {
                if (maxVisibility <= page.visibility) {
                    if (!page.parentId) {
                        newTopLevelPageIDList.push(page.id)
                    }
                    page.childrenOpen = false
                    map.set(page.id, page)
                    continue
                }
                map.delete(page.id)
            }
            for (const page of map.values()) {
                const newChildren = page.children.filter((childID: string) => map.get(childID))
                for (const [index, childID] of newChildren.entries()) {
                    const child = map.get(childID) as HierarchyDocumentInfoInterface
                    child.order = index
                    map.set(childID, child)
                }
                page.children = newChildren
                map.set(page.id, page)
            }
            newTopLevelPageIDList.sort((a, b) => {
                const aDocument = map.get(a) as HierarchyDocumentInfoInterface
                const bDocument = map.get(b) as HierarchyDocumentInfoInterface
                return aDocument.order - bDocument.order
            })
            topLevelPageIDList.delete(0, topLevelPageIDList.length)
            topLevelPageIDList.insert(0, newTopLevelPageIDList)
        })
        return blog
    }

    async getBlog (viewer: User, blogID: number) {
        const blog = await LiveBlogRepo.getBlog(blogID)
        if (!blog) {
            throw new BlogNotExists()
        }
        const filteredBlog = await this._filterBlog(blog, blogID, viewer)
        return new GetHierarcyResponseDTO(Array.from(Y.encodeStateAsUpdate(filteredBlog)))
    }

    async getBlogName (blogID: number) {
        const blog = await BlogRepo.getBlog(blogID)
        if (!blog) {
            throw new BlogNotExists()
        }
        return new GetBlogNameResponseDTO(blog.blog_name)
    }

    private async _getBlogInfoMapByInfoList (viewer: User, infoList: Blog[]) {
        const userBlogIDList = viewer ? (await BlogUserRepo.getBlogUsersByUserID(viewer.id)).map(user => user.blog_id) : []
        const infoMap: any = {}
        for (const info of infoList) {
            if (info.is_private && !userBlogIDList.includes(info.id)) {
                continue
            }
            infoMap[info.id] = new BlogInfo(info.id, info.blog_name, info.biography, info.profile_image_url)
        }
        return infoMap
    }

    async getBlogInfoMapByIDList (viewer: User, blogIDList: number[]) {
        if (blogIDList.length > 100) {
            throw new TooManyUserRequestError()
        }
        const blogInfoList = await BlogRepo.getBlogs(blogIDList)
        const infoMap: any = await this._getBlogInfoMapByInfoList(viewer, blogInfoList)
        return new GetBlogInfoMapByBlogIDListResponseDTO(infoMap)
    }

    async getBlogInfoMapByNameList (viewer: User, blogNicknameList: string[]) {
        if (blogNicknameList.length > 100) {
            throw new TooManyUserRequestError()
        }
        const blogInfoList = await BlogRepo.getBlogsByNameList(blogNicknameList)
        const infoMap: any = await this._getBlogInfoMapByInfoList(viewer, blogInfoList)
        return new GetBlogInfoMapByBlogIDListResponseDTO(infoMap)
    }

    async getBlogFollowerCount (blogID: number) {
        const authority = await this.viewerAPI.getBlogAuthority(blogID)
        if (!authority.viewable) {
            throw new UnauthorizedForBlog()
        }
        const followerCount = await BlogFollowRepo.getBlogFollowerCount(blogID)
        return new GetBlogFollowerCountDTO(followerCount)
    }
}
