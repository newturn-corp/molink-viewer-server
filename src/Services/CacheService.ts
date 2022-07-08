import env from '../env'
import { RedisConnector } from '@newturn-develop/molink-utils'

class CacheService {
    main: RedisConnector

    constructor () {
        this.main = new RedisConnector(env.redis.main.host, env.redis.main.port, 'main-redis', env.isDevelopment)
        this.main.connect()
    }
}
export default new CacheService()
