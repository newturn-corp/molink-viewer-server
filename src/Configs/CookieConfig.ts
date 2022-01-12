import { CookieOptions } from 'express'
import env from '../env'

export const CookieConfig: CookieOptions = env.isLocal
    ? {
        sameSite: 'none'
    }
    : {
        secure: true,
        httpOnly: true,
        sameSite: 'none'
    }
