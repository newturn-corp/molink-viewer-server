import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    hierarchyRedis: RedisConnector

    constructor () {
        this.hierarchyRedis = new RedisConnector(env.redis.hierarchy.host, env.redis.hierarchy.port)
        this.hierarchyRedis.connect()
    }
}
export default new CacheService()
