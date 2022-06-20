import {
    GetFollowPageListDTO, GetPageListDTO,
    GetPageListResponseDTO,
    GetUserPageListDTO,
    GetUserPageListResponseDTO,
    PageVisibility,
    User
} from '@newturn-develop/types-molink'
import AuthorityService from './AuthorityService'
import ESPageRepo from '../Repositories/ESPageRepo'
import FollowRepo from '../Repositories/FollowRepo'
import { TooManyPageRequestError } from '../Errors/PageError'
import BlogUserRepo from '../Repositories/BlogUserRepo'

class PageListService {
    async getMaxBlogPageVisibility (blogID: number, viewer: User | null) {
        if (!viewer) {
            return PageVisibility.Public
        }
        const blogUser = await BlogUserRepo.getBlogUser(blogID, viewer.id)
        if (blogUser) {
            return PageVisibility.Private
        }
        const isFollower = await AuthorityService.checkUserFollowBlog(blogID, viewer.id)
        if (isFollower) {
            return PageVisibility.OnlyFollower
        } else {
            return PageVisibility.Public
        }
    }

    async getBlogPageList (user: User, blogID: number, dto: GetPageListDTO) {
        if (dto.count > 20) {
            throw new TooManyPageRequestError()
        }
        const maxVisibility = await this.getMaxBlogPageVisibility(blogID, user)
        const { total, documents } = await ESPageRepo.getBlogPageSummaryList(blogID, maxVisibility, dto.count, dto.from)
        return new GetPageListResponseDTO(total, documents)
    }

    async getFollowPageList (user: User, dto: GetPageListDTO) {
        const follows = await FollowRepo.getFollowerFollows(user.id)
        const followIdList = follows.map(follow => follow.user_id)
        const { total, documents } = await ESPageRepo.getFollowPageList(followIdList, dto.count, dto.from)
        return new GetPageListResponseDTO(total, documents)
    }

    async getPopularPageList (dto: GetPageListDTO) {
        if (dto.count > 20) {
            throw new TooManyPageRequestError()
        }
        const { total, documents } = await ESPageRepo.getPopularPageList(dto.count, dto.from)
        return new GetPageListResponseDTO(total, documents)
    }
}
export default new PageListService()
