import {
    GetFollowPageListDTO,
    GetPageListResponseDTO,
    GetUserPageListDTO,
    GetUserPageListResponseDTO,
    PageVisibility,
    User
} from '@newturn-develop/types-molink'
import AuthorityService from './AuthorityService'
import ESPageRepo from '../Repositories/ESPageRepo'
import FollowRepo from '../Repositories/FollowRepo'

class BlogService {
    async getMaxPageVisibility (targetId: number, viewer: User | null) {
        if (!viewer) {
            return PageVisibility.Public
        }
        if (viewer.id === targetId) {
            return PageVisibility.Private
        }
        const isFollower = await AuthorityService.checkIsFollower(targetId, viewer.id)
        if (isFollower) {
            return PageVisibility.OnlyFollower
        } else {
            return PageVisibility.Public
        }
    }

    async getUserPageList (user: User, dto: GetUserPageListDTO) {
        const maxVisibility = await this.getMaxPageVisibility(dto.userId, user)
        const { total, documents } = await ESPageRepo.getUserPageSummaryList(dto.userId, maxVisibility, 6, dto.from)
        return new GetPageListResponseDTO(total, documents)
    }

    async getFollowPageList (user: User, dto: GetFollowPageListDTO) {
        const follows = await FollowRepo.getFollowerFollows(user.id)
        const followIdList = follows.map(follow => follow.user_id)
        const { total, documents } = await ESPageRepo.getFollowPageList(followIdList, dto.count, dto.from)
        return new GetPageListResponseDTO(total, documents)
    }
}
export default new BlogService()
