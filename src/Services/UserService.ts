import UserRepo from '../Repositories/UserRepo'
import { UserNotExists } from '../Errors/Common'
import { GetUserIDDTO } from '@newturn-develop/types-molink'

class UserService {
    async getUserIDByNickname (nickname: string) {
        const user = await UserRepo.getActiveUserByNickname(nickname)
        if (!user) {
            throw new UserNotExists()
        }
        return new GetUserIDDTO(user.id)
    }
}
export default new UserService()
