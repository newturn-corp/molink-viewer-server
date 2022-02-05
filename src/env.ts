import dotenv from 'dotenv'
dotenv.config()

const env = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isLocal: process.env.NODE_ENV === 'local',
    port: Number(process.env.PORT) || 8000,
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!
    },
    opensearch: {
        index: process.env.OPENSEARCH_INDEX!,
        domain: process.env.OPENSEARCH_DOMAIN!,
        region: process.env.OPENSEARCH_REGION!
    },
    mysql: {
        host: process.env.MYSQL_DB_HOST!,
        port: Number(process.env.MYSQL_DB_PORT) || 3306,
        user: process.env.MYSQL_DB_USER!,
        password: process.env.MYSQL_DB_PASSWORD!,
        database: process.env.MYSQL_DB_NAME!
    },
    jwt: process.env.JWT_SECRET!,
    secret: {
        cookie: process.env.COOKIE_SECRET!
    },
    slack: {
        token: process.env.SLACK_BOT_TOKEN!
    },
    redis: {
        hierarchy: {
            host: process.env.HIERARCHY_REDIS_HOST!,
            port: Number(process.env.HIERARCHY_REDIS_PORT) || 6379
        },
        content: {
            host: process.env.CONTENT_REDIS_HOST!,
            port: Number(process.env.CONTENT_REDIS_PORT) || 6379
        },
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT) || 6379
    },
    postgre: {
        host: process.env.POSTGRE_DB_HOST!,
        user: process.env.POSTGRE_DB_USER!,
        password: process.env.POSTGRE_DB_PASSWORD!,
        name: process.env.POSTGRE_DB_NAME!
    },
    allow_origin_list: process.env.ALLOW_ORIGIN_LIST!
}

const validateEnv = (data: Record<string, unknown> | null) => {
    if (data === null) return
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
            validateEnv(value as Record<string, unknown> | null)
        } else if (value == null) {
            const message = `${key} missing in env`
            console.log(message)
        }
    }
}

validateEnv(env)

export default env
