import express from 'express'
import dotenv from 'dotenv'

import 'reflect-metadata'
import { useMiddleware } from './Configs/middlewareConfig'
import env from './env'
import { Slack } from '@newturn-develop/molink-utils'

dotenv.config()
Slack.init(env.slack.token)

const app = express()
useMiddleware(app)
app.listen(env.port, () => {
    console.log(`knowlink-viewer start at ${env.port}`)
})

export default app
