import express from 'express'
import session from 'express-session'
import { sessionOptions } from './SessionConfig'
import { useExpressServer } from 'routing-controllers'
import cors from 'cors'
import env from '../env'
import moment from 'moment-timezone'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { routingControllersOptions } from './routingConfig'
import userAgent from 'express-useragent'

export function useMiddleware (app: express.Application) {
    app.set('port', env.port || 8000)
    app.use(
        cors({
            credentials: true,
            preflightContinue: true,
            origin: env.allow_origin_list.split(',')
        })
    )
    morgan.token('date', () => {
        return moment().format('YYYY-MM-DD HH:mm:ss')
    })
    const logFormat = ':req[X-Real-IP] [:date[clf]] ":method :url" :status :res[content-length] - :response-time ms ":user-agent"'
    app.use(cookieParser(env.secret.cookie))
    app.use(session(sessionOptions()))
    app.use(morgan(logFormat))
    app.use(userAgent.express())
    useExpressServer(app, routingControllersOptions)
}
