import { CookieOptions } from 'express'
import env from '../env'

export const CookieConfig: CookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    domain: env.isProduction ? 'molink.life' : 'development.molink.life'
}
