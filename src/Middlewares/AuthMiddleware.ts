import jwt from 'jsonwebtoken'
import { Action, UnauthorizedError } from 'routing-controllers'
import env from '../env'
import { JWTUser } from '../Types/JWTUser'
import UserRepo from '../repo/UserRepo'
export class AuthMiddleware {
    static async authorization (action: Action) {
        const { token } = action.request.cookies

        if (!token) return false

        try {
            jwt.verify(token, env.jwt)
            return true
        } catch (e) {
            return false
        }
    }

    static async currentUser (action: Action) {
        const { token } = action.request.cookies
        if (!token) return false
        try {
            const decoded = jwt.verify(token, env.jwt) as JWTUser
            if (!decoded.id) {
                throw new UnauthorizedError()
            }

            const user = await UserRepo.getActiveUserById(decoded.id)
            if (!user) {
                throw new UnauthorizedError()
            }
            return user
        } catch (e) {
            throw new UnauthorizedError()
        }
    }
}
