import express from 'express'
import dotenv from 'dotenv'

import 'reflect-metadata'
import { useMiddleware } from './Configs/middlewareConfig'
import env from './env'
import { OpenSearch, Slack } from '@newturn-develop/molink-utils'
import ip from 'ip'

dotenv.config()
Slack.init(env.slack.token)
OpenSearch.init(env.opensearch.domain, env.opensearch.region)

const app = express()
useMiddleware(app)
app.listen(env.port, () => {
    try {
        console.log(`Viewer Server Start\nIP: ${ip.address()}\nInstance: ${env.appInstance}`)
        Slack.sendTextMessage(`Viewer Server Start\nIP: ${ip.address()}\nInstance: ${env.appInstance}`, env.isProduction ? 'C033BV5JDDG' : 'C033QHV6HU1')
    } catch (err) {
        console.log(err)
    }
})

export default app
