import pool from './mysql'

export default async (fn: Function) => {
    try {
        const connection = await pool.getConnection()
        try {
            const result = await fn(connection)
            connection.release()
            return result
        } catch (err: any) {
            connection.release()
            throw new Error(err)
        }
    } catch (err: any) {
        throw new Error(err)
    }
}
