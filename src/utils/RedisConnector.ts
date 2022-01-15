import Redis from 'ioredis'
import ip from 'ip'
import env from '../env'

import Slack from './Slack'

export default class RedisConnector {
    private _client: Redis.Redis
    private _connectionState: boolean = false

    constructor (host: string, port: number) {
        this._client = new Redis({
            host,
            port,
            showFriendlyErrorStack: true,
            enableReadyCheck: true,
            lazyConnect: true,
            maxRetriesPerRequest: 5,
            retryStrategy (times) {
                const delay = Math.min(times * 50, 2000)
                console.log(`Redis Retry ${times} times ${delay}ms`)
                return delay
            },
            reconnectOnError (error) {
                const targetError = 'READONLY'
                if (error.message.includes(targetError)) {
                    // Only reconnect when the error contains "READONLY"
                    return true // or `return 1;`
                }
                return false
            }
        })
        this._client.on('connect', () => {
            console.log('RedisConnector Event connect')
            this._connectionState = true
        })
        this._client.on('ready', () => {
            console.log('RedisConnector Event ready')
        })
        this._client.on('error', () => {
            console.log('RedisConnector Event error')
        })
        this._client.on('close', () => {
            if (env.isProduction) {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - close`, 'C02SE9VA8TC')
            } else {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - close`, 'C02TWKQHJ64')
            }
            console.log('RedisConnector Event close')
            this._connectionState = false
        })
        this._client.on('reconnecting', () => {
            if (env.isProduction) {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - reconnecting`, 'C02SE9VA8TC')
            } else {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - reconnecting`, 'C02TWKQHJ64')
            }
            console.log('RedisConnector Event reconnecting')
        })
        this._client.on('end', () => {
            if (env.isProduction) {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - end`, 'C02SE9VA8TC')
            } else {
                Slack.sendTextMessage(`Error occurred in Redis at ${ip.address()} - end`, 'C02TWKQHJ64')
            }
            console.log('RedisConnector Event end')
            this._connectionState = false
        })
        this._client.on('wait', () => {
            console.log('RedisConnector Event wait')
        })
    }

    async connect () {
        console.log('Wait For RedisConnector Connection')
        if (this._connectionState) {
            return
        }
        await this._client.connect()
    }

    async disconnect () {
        console.log('Wait For RedisConnector Disconnect')
        if (!this._connectionState) {
            console.log('RedisConnector is not connected. Skip disconnect')
            return
        }
        await this._client.disconnect()
    }

    isConnected () {
        return this._connectionState
    }

    async get (key: Redis.KeyType) {
        const result = await this._client.get(key)
        return result
    }

    async setNxWithEx (key: Redis.KeyType, value: Redis.ValueType, ttl: number) {
        const result = await this._client.setnx(key, value)
        if (result === 0) {
            return false
        }
        await this._client.expire(key, ttl)
        return true
    }

    async setWithEx (key: Redis.KeyType, value: Redis.ValueType, ttl: number) {
        const result = await this._client.set(key, value, 'EX', ttl)
        return result === 'OK'
    }

    async set (key: Redis.KeyType, value: Redis.ValueType) {
        return !!(await this._client.set(key, value))
    }

    async lTrim (key: Redis.KeyType, start: number, stop: number) {
        await this._client.ltrim(key, start, stop)
    }

    async lPush (key: Redis.KeyType, value: Redis.ValueType) {
        return this._client.lpush(key, value)
    }

    async lPop (key: Redis.KeyType) {
        const value = await this._client.lpop(key)
        return value === 'nil' ? null : value
    }

    async lRange (key: Redis.KeyType, start: number, stop: number) {
        return this._client.lrange(key, start, stop)
    }

    async expire (key: Redis.KeyType, ttl: number) {
        const result = await this._client.expire(key, ttl)
        return result === 1
    }

    async del (key: Redis.KeyType) {
        return this._client.del(key)
    }

    async hmset (key: Redis.KeyType, value: any) {
        return this._client.hmset(key, value)
    }

    async hgetall (key: Redis.KeyType) {
        return this._client.hgetall(key)
    }
}
