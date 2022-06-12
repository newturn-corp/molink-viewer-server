import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    main: RedisConnector
    hierarchy: RedisConnector

    constructor () {
        this.hierarchy = new RedisConnector(env.redis.hierarchy.host, env.redis.hierarchy.port, 'hierarchy-redis', env.isDevelopment)
        this.hierarchy.connect()
        this.main = new RedisConnector(env.redis.main.host, env.redis.main.port, 'main-redis', env.isDevelopment)
        this.main.connect()
    }
}
export default new CacheService()
