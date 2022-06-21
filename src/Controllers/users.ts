import { JsonController, Get, CurrentUser, Param, QueryParam, Authorized } from 'routing-controllers'
import {
    makeEmptyResponseMessage,
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import UserService from '../Services/UserService'
import { UserNotExists } from '../Errors/Common'
import { TooManyUserRequestError } from '../Errors/UserError'

@JsonController('/users')
export class UserController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Get('/:nickname/id')
    async getUserIDByNickname (@Param('nickname') nickname: string) {
        try {
            const dto = await UserService.getUserIDByNickname(nickname)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof UserNotExists) {
                throw new CustomHttpError(404, 1, '문서가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/')
    async getUserInfoByIDMap (@QueryParam('userIDList') userIDList: string) {
        try {
            const data = await UserService.getUserInfoByIdMap(userIDList.split(',').map(Number))
            return makeResponseMessage(200, data)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/nickname-list')
    async getUserInfoByNicknameMap (@QueryParam('userNicknameList') userNicknameList: string) {
        try {
            const data = await UserService.getUserInfoByNicknameList(userNicknameList.split(','))
            return makeResponseMessage(200, data)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:userId/follow-info')
    async getFollowInfo (@CurrentUser() user: User, @Param('userId') userId: string) {
        const dto = await UserService.getFollowInfo(user, Number(userId))
        return makeResponseMessage(200, dto)
    }

    @Get('/:userId/follow-status')
    @Authorized()
    async getFollowStatus (@CurrentUser() user: User, @Param('userId') userId: string) {
        const dto = await UserService.getFollowStatus(user, Number(userId))
        return makeResponseMessage(200, dto)
    }
}
