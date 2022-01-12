import session from 'express-session'
import env from '../env'

const sessionOptions = (): session.SessionOptions => {
    if (env.isLocal) {
        return {
            resave: false,
            saveUninitialized: false,
            secret: env.secret.cookie,
            cookie: {
                secure: false,
                sameSite: 'none'
            }
        }
    }
    return {
        resave: false,
        saveUninitialized: false,
        secret: env.secret.cookie,
        cookie: {
            httpOnly: true,
            secure: true
        },
        proxy: true
    }
}

export { sessionOptions }
