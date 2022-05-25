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

    async getFollowInfo (user: User, targetUserId: number) {
        const { count: followerCount } = await FollowRepo.getUserFollowerCount(targetUserId)
        const { count: followCount } = await FollowRepo.getUserFollowCount(targetUserId)
        return new GetFollowInfoResponseDTO(followerCount, followCount)
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
}
export default new UserService()
