import UserRepo from '../Repositories/UserRepo'
import { UserNotExists } from '../Errors/Common'
import { GetUserIDDTO, GetUserInfoByUserMapDTO, GetUserInfoByUserMapResponseDTO } from '@newturn-develop/types-molink'
import ESUserRepo from '../Repositories/ESUserRepo'
import { TooManyUserRequestError } from '../Errors/UserError'

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
}
export default new UserService()
