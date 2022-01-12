import query from '../utils/queryBuilder'

export default class BaseRepo {
    protected _selectSingular (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows[0]
        })
    }

    protected _selectPlural (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows
        })
    }

    protected _insert (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.insertId
        })
    }

    protected _insertReturningAffectedRows (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.affectedRows
        })
    }

    protected _update (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [obj] = await conn.query(queryString, args)
            return obj.affectedRows
        })
    }

    protected _delete (queryString: string, args: any) {
        return query(async (conn: any) => {
            await conn.query(queryString, args)
        })
    }

    protected _check (queryString: string, args: any) {
        return query(async (conn: any) => {
            const [rows] = await conn.query(queryString, args)
            return rows.length !== 0
        })
    }
}
