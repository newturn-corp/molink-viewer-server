import UserRepo from '../Repositories/UserRepo'
import { UserNotExists } from '../Errors/Common'
import {
    GetFollowInfoResponseDTO,
    GetUserIDDTO,
    GetUserInfoByUserMapDTO,
    GetUserInfoByUserMapResponseDTO
} from '@newturn-develop/types-molink'
import ESUserRepo from '../Repositories/ESUserRepo'
import { TooManyUserRequestError } from '../Errors/UserError'
import FollowRepo from '../Repositories/FollowRepo'
import User from '../Domains/User'

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
}
export default new UserService()
