import UserRepo from '../Repositories/UserRepo'
import { UserNotExists } from '../Errors/Common'
import {
    FollowStatus,
    GetFollowInfoResponseDTO,
    GetFollowStatusResponseDTO,
    GetUserIDDTO,
    GetUserInfoByUserMapResponseDTO
} from '@newturn-develop/types-molink'
import ESUserRepo from '../Repositories/ESUserRepo'
import { TooManyUserRequestError } from '../Errors/UserError'
import FollowRepo from '../Repositories/FollowRepo'
import User from '../Domains/User'
import FollowRequestRepo from '../Repositories/FollowRequestRepo'
import BlogRepo from '../Repositories/BlogRepo'
import ESBlogRepo from '../Repositories/ESBlogRepo'
import BlogFollowRepo from '../Repositories/BlogFollowRepo'

class UserService {
    async getUserIDByNickname (nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new UserNotExists()
        }
        return new GetUserIDDTO(user.id)
    }

    async getUserInfoByIdMap (userIDList: number[]) {
        if (userIDList.length > 100) {
            throw new TooManyUserRequestError()
        }
        const userInfoList = await ESUserRepo.getUserInfoListByIdList(userIDList)
        const infoMap: any = {}
        for (const info of userInfoList) {
            infoMap[info.id] = info
        }
        return new GetUserInfoByUserMapResponseDTO(infoMap)
    }

    async getUserInfoByNicknameList (userNicknameList: string[]) {
        if (userNicknameList.length > 100) {
            throw new TooManyUserRequestError()
        }
        const userInfoList = await ESUserRepo.getUserInfoListByNicknameList(userNicknameList)
        const infoMap: any = {}
        for (const info of userInfoList) {
            infoMap[info.nickname] = info
        }
        return new GetUserInfoByUserMapResponseDTO(infoMap)
    }

    async getUserFollowBlogs (user: User, targetUserId: number) {
        const follows = await BlogFollowRepo.getUserBlogFollows(targetUserId)
        const blogs = await ESBlogRepo.getBlogs(follows.map(follow => follow.user_id))
        return blogs
    }

    async getFollowStatus (user: User, targetUserId: number) {
        const isFollow = await FollowRepo.checkUserFollow(user.id, targetUserId)
        if (isFollow) {
            return new GetFollowStatusResponseDTO(FollowStatus.Following)
        }
        const isFollowRequested = await FollowRequestRepo.checkActiveFollowRequest(user.id, targetUserId)
        if (isFollowRequested) {
            return new GetFollowStatusResponseDTO(FollowStatus.FollowRequested)
        }
        const isFollowed = await FollowRepo.checkUserFollow(targetUserId, user.id)
        if (isFollowed) {
            return new GetFollowStatusResponseDTO(FollowStatus.Followed)
        }
        return new GetFollowStatusResponseDTO(FollowStatus.Default)
    }

    async getUserBlogs (user: User, userID: number) {
        const blogs = (user && user.id === userID) ? await BlogRepo.getBlogsByUserID(userID) : await BlogRepo.getPublicBlogsByUserID(userID)
        return ESBlogRepo.getBlogs(blogs.map(blog => blog.id))
    }
}
export default new UserService()
