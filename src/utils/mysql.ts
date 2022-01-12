import mysql from 'mysql2/promise'
import env from '../env'

export default mysql.createPool({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    database: env.mysql.database,
    multipleStatements: true,
    connectionLimit: 200
})
