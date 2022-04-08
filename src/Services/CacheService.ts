import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    hierarchy: RedisConnector

    constructor () {
        this.hierarchy = new RedisConnector(env.redis.hierarchy.host, env.redis.hierarchy.port, 'hierarchy-redis', env.isDevelopment)
        this.hierarchy.connect()
    }
}
export default new CacheService()
