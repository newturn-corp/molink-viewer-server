import express from 'express'
import dotenv from 'dotenv'

import 'reflect-metadata'
import { useMiddleware } from './Configs/middlewareConfig'
import env from './env'

dotenv.config()

const app = express()
useMiddleware(app)
app.listen(env.port, () => {
    console.log(`knowlink-viewer start at ${env.port}`)
})

export default app
