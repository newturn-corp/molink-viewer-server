import env from '../env'
import RedisConnector from '../utils/RedisConnector'

class CacheService {
    liveRedis: RedisConnector

    constructor () {
        this.liveRedis = new RedisConnector(env.redis.live.host, env.redis.live.port)
        this.liveRedis.connect()
    }
}
export default new CacheService()
