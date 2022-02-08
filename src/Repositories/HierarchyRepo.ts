import { Knex } from 'knex'
import { getKnexClient } from '@newturn-develop/molink-utils'
import env from '../env'
import * as Y from 'yjs'

interface HierarchyUpdate {
    id: string;
    userId: number;
    update: Uint8Array;
}

class HierarchyRepo {
    client: Knex<HierarchyUpdate>

    constructor () {
        this.client = getKnexClient('pg', env.postgre.hierarchy.host, env.postgre.hierarchy.user, env.postgre.hierarchy.password, env.postgre.hierarchy.name)
    }

    async getHierarchy (userId: number) {
        const updates = await this.client.transaction(async (transaction) => {
            const updates = await this.client<HierarchyUpdate>('items').transacting(transaction).where('userId', userId).forUpdate().orderBy('id')

            if (updates.length >= 50) {
                const dbYDoc = new Y.Doc()

                dbYDoc.transact(() => {
                    for (const { update } of updates) {
                        Y.applyUpdate(dbYDoc, update)
                    }
                })

                const [mergedUpdates] = await Promise.all([
                    this.client<HierarchyUpdate>('items').transacting(transaction).insert({ userId, update: Y.encodeStateAsUpdate(dbYDoc) }).returning('*'),
                    this.client<HierarchyUpdate>('items').transacting(transaction).where('userId', userId).whereIn('id', updates.map(({ id }) => id)).delete()
                ])

                return mergedUpdates
            } else {
                return updates
            }
        })
        if (updates.length === 0) {
            return undefined
        }
        const document = new Y.Doc()
        document.transact(() => {
            for (const { update } of updates) {
                Y.applyUpdate(document, update)
            }
        })
        return document
    }
}

export default new HierarchyRepo()
