import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    liveRedis: RedisConnector
    hierarchyChildrenOpenRedis: RedisConnector

    constructor () {
        this.liveRedis = new RedisConnector(env.redis.live.host, env.redis.live.port)
        this.liveRedis.connect()
        this.hierarchyChildrenOpenRedis = new RedisConnector(env.redis.hierarchyChildrenOpen.host, env.redis.hierarchyChildrenOpen.port)
        this.hierarchyChildrenOpenRedis.connect()
    }
}
export default new CacheService()
