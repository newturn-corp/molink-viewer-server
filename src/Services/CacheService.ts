import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    hierarchyRedis: RedisConnector
    contentRedis: RedisConnector

    constructor () {
        this.hierarchyRedis = new RedisConnector(env.redis.hierarchy.host, env.redis.hierarchy.port)
        this.hierarchyRedis.connect()
        this.contentRedis = new RedisConnector(env.redis.content.host, env.redis.content.port)
        this.contentRedis.connect()
    }
}
export default new CacheService()
